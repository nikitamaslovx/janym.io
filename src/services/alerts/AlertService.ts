import { botService } from '../bot/BotService';
import { metricsService } from '../metrics/MetricsService';

export type AlertRule = {
  id: string;
  botId?: string; // If null, applies to all bots
  organizationId: string;
  type: 'pnl_threshold' | 'balance_threshold' | 'error' | 'bot_stopped';
  condition: {
    operator: 'gt' | 'lt' | 'eq';
    value: number;
  };
  enabled: boolean;
  channels: ('email' | 'slack' | 'telegram')[];
};

class AlertService {
  private rules: AlertRule[] = [];

  async checkAlerts(orgId: string) {
    const bots = await botService.listBots(orgId);

    for (const bot of bots) {
      // Check bot-specific alerts
      await this.checkBotAlerts(bot.id, orgId);

      // Check general alerts
      const generalRules = this.rules.filter(
        r => r.organizationId === orgId && !r.botId && r.enabled,
      );
      await this.checkGeneralAlerts(bot.id, generalRules);
    }
  }

  private async checkBotAlerts(botId: string, orgId: string) {
    const botRules = this.rules.filter(
      r => r.organizationId === orgId && r.botId === botId && r.enabled,
    );

    if (botRules.length === 0) {
      return;
    }

    const metrics = await metricsService.getLatestMetrics(botId);
    if (!metrics) {
      return;
    }

    for (const rule of botRules) {
      let shouldAlert = false;

      switch (rule.type) {
        case 'pnl_threshold':
          if (metrics.totalPnl !== null) {
            shouldAlert = this.evaluateCondition(
              metrics.totalPnl,
              rule.condition.operator,
              rule.condition.value,
            );
          }
          break;
        case 'balance_threshold':
          if (metrics.balanceUsd !== null) {
            shouldAlert = this.evaluateCondition(
              metrics.balanceUsd,
              rule.condition.operator,
              rule.condition.value,
            );
          }
          break;
        case 'error':
          // Check for error logs
          // This would require querying bot_logs table
          break;
        case 'bot_stopped':
          const bot = await botService.getBot(botId, orgId);
          if (bot && bot.status === 'stopped') {
            shouldAlert = true;
          }
          break;
      }

      if (shouldAlert) {
        await this.sendAlert(rule, botId);
      }
    }
  }

  private async checkGeneralAlerts(botId: string, rules: AlertRule[]) {
    // Similar logic for general alerts
    for (const rule of rules) {
      // Check conditions
      // Send alerts if needed
    }
  }

  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case 'gt':
        return value > threshold;
      case 'lt':
        return value < threshold;
      case 'eq':
        return Math.abs(value - threshold) < 0.01;
      default:
        return false;
    }
  }

  private async sendAlert(rule: AlertRule, botId: string) {
    // TODO: Implement actual notification sending
    // For now, just log
    console.log(`Alert triggered: ${rule.type} for bot ${botId}`, rule);

    // In production, this would:
    // - Send email via SMTP service
    // - Send Slack message via webhook
    // - Send Telegram message via bot API
  }

  async addRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  async removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  async getRules(orgId: string): Promise<AlertRule[]> {
    return this.rules.filter(r => r.organizationId === orgId);
  }
}

export const alertService = new AlertService();
