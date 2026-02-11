import { eq, and } from 'drizzle-orm';

import { db } from '@/libs/DB';
import { botsSchema, organizationSchema } from '@/models/Schema';

import type { Bot, BotCreateInput, BotUpdateInput } from './types';
import { mqttService } from '../mqtt/MQTTService';

export class BotService {
  async createBot(input: BotCreateInput): Promise<Bot> {
    // Ensure organization exists in our DB
    await db
      .insert(organizationSchema)
      .values({ id: input.organizationId })
      .onConflictDoNothing();

    const [bot] = await db
      .insert(botsSchema)
      .values({
        organizationId: input.organizationId,
        name: input.name,
        strategyType: input.strategyType,
        exchange: input.exchange,
        tradingPair: input.tradingPair,
        config: input.config,
        status: 'stopped',
      })
      .returning();

    if (!bot) {
      throw new Error('Failed to create bot');
    }

    // Subscribe to bot status updates
    await mqttService.subscribeToBot(bot.id, (_topic, message) => {
      try {
        const payload = JSON.parse(message.toString());
        if (payload.status) {
          this.updateBotStatus(bot.id, input.organizationId, payload.status as string).catch(
            (error) => {
              console.error('Failed to update bot status from MQTT', error);
            },
          );
        }
      } catch (error) {
        console.error('Failed to parse MQTT status message', error);
      }
    });

    return bot;
  }

  async updateBot(input: BotUpdateInput): Promise<Bot> {
    const { id, organizationId, ...updateData } = input;

    const [updatedBot] = await db
      .update(botsSchema)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(botsSchema.id, id), eq(botsSchema.organizationId, organizationId)))
      .returning();

    if (!updatedBot) {
      throw new Error('Bot not found or access denied');
    }

    return updatedBot;
  }

  async deleteBot(botId: string, organizationId: string): Promise<void> {
    // Verify bot exists and belongs to organization
    const bot = await this.getBot(botId, organizationId);
    if (!bot) {
      throw new Error('Bot not found or access denied');
    }

    await db
      .delete(botsSchema)
      .where(and(eq(botsSchema.id, botId), eq(botsSchema.organizationId, organizationId)));

    // Unsubscribe from bot updates
    await mqttService.unsubscribeFromBot(botId);
  }

  async getBot(botId: string, organizationId: string): Promise<Bot | null> {
    const [bot] = await db
      .select()
      .from(botsSchema)
      .where(and(eq(botsSchema.id, botId), eq(botsSchema.organizationId, organizationId)))
      .limit(1);

    return bot || null;
  }

  async listBots(organizationId: string): Promise<Bot[]> {
    const bots = await db
      .select()
      .from(botsSchema)
      .where(eq(botsSchema.organizationId, organizationId));

    return bots;
  }

  async startBot(botId: string, organizationId: string): Promise<void> {
    // Verify bot exists and belongs to organization
    const bot = await this.getBot(botId, organizationId);
    if (!bot) {
      throw new Error('Bot not found or access denied');
    }

    // Update status to starting
    await this.updateBotStatus(botId, organizationId, 'starting');

    // Publish start command via MQTT
    await mqttService.publishCommand(botId, 'start', {
      config: bot.config as Record<string, unknown>,
    });
  }

  async stopBot(botId: string, organizationId: string): Promise<void> {
    // Verify bot exists and belongs to organization
    const bot = await this.getBot(botId, organizationId);
    if (!bot) {
      throw new Error('Bot not found or access denied');
    }

    // Publish stop command via MQTT
    await mqttService.publishCommand(botId, 'stop');

    // Update status to stopped
    await this.updateBotStatus(botId, organizationId, 'stopped');
  }

  async restartBot(botId: string, organizationId: string): Promise<void> {
    await this.stopBot(botId, organizationId);
    // Wait a bit before restarting
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.startBot(botId, organizationId);
  }

  private async updateBotStatus(
    botId: string,
    organizationId: string,
    status: string,
  ): Promise<void> {
    await db
      .update(botsSchema)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(botsSchema.id, botId), eq(botsSchema.organizationId, organizationId)));
  }
}

export const botService = new BotService();
