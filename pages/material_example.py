import streamlit as st
import sys
from pathlib import Path

# Добавляем путь к компонентам
sys.path.insert(0, str(Path(__file__).parent.parent))

from frontend.components.material_ui import (
    inject_material_css,
    render_material_page_header,
    render_material_stats_card,
    render_material_card
)

# Конфигурация страницы
st.set_page_config(page_title="Material Dashboard Example", layout="wide")

# Применяем Material стили
inject_material_css()

# Заголовок
render_material_page_header(
    "Material Dashboard",
    "Example page with Material Design components"
)

# Статистика
col1, col2, col3, col4 = st.columns(4)

with col1:
    render_material_stats_card(
        label="Active Bots",
        value="12",
        icon="🤖",
        gradient="success",
        footer_text="+3 this week",
        footer_icon="📈"
    )

with col2:
    render_material_stats_card(
        label="Total Volume",
        value="$847K",
        icon="💰",
        gradient="info",
        footer_text="+12.5% today"
    )

with col3:
    render_material_stats_card(
        label="Profit 24h",
        value="$3,247",
        icon="📊",
        gradient="success",
        footer_text="+8.3%"
    )

with col4:
    render_material_stats_card(
        label="Trades Today",
        value="1,432",
        icon="🔄",
        gradient="warning",
        footer_text="Average volume"
    )

st.markdown("---")

# Дополнительные карточки
col1, col2 = st.columns(2)

with col1:
    render_material_card(
        title="Trading Performance",
        icon="📈",
        content="Your charts and data here"
    )

with col2:
    render_material_card(
        title="Recent Activity",
        icon="📋",
        content="Your activity feed here"
    )

st.success("✅ Material Dashboard UI успешно установлен!")
