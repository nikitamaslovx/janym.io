#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Material Dashboard UI Installer for Hummingbot      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Проверка что мы в папке deploy
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Ошибка: docker-compose.yml не найден${NC}"
    echo -e "${YELLOW}Пожалуйста, запустите скрипт из папки ~/deploy${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Найден docker-compose.yml"

# Создаем структуру папок
echo ""
echo -e "${BLUE}📁 Создание структуры папок...${NC}"

mkdir -p material_ui/components
mkdir -p material_ui/visualization

echo -e "${GREEN}✓${NC} Папки созданы: material_ui/components и material_ui/visualization"

# Создаем material_ui.py
echo ""
echo -e "${BLUE}🎨 Создание material_ui.py...${NC}"

cat > material_ui/components/material_ui.py << 'EOFMATERIAL'
"""
Material Dashboard UI Components for Streamlit
Inspired by Creative Tim's Material Dashboard
"""

import streamlit as st

def inject_material_css():
    """Inject Material Dashboard CSS"""
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');
        
        * {
            font-family: 'Roboto', sans-serif;
        }
        
        .main {
            background-color: #f0f2f5;
        }
        
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        
        .stButton > button {
            background: linear-gradient(195deg, #42424a 0%, #191919 100%);
            color: white;
            border: none;
            border-radius: 0.5rem;
            padding: 0.75rem 1.5rem;
            font-weight: 700;
            font-size: 0.75rem;
            text-transform: uppercase;
            box-shadow: 0 4px 7px -1px rgba(0,0,0,0.11);
            transition: all 0.15s ease-in;
        }
        
        .stButton > button:hover {
            box-shadow: 0 14px 26px -12px rgba(0,0,0,0.42);
            transform: translateY(-2px);
        }
        
        h1, h2, h3 {
            color: #344767;
            font-weight: 700;
        }
        
        .material-card {
            background: #ffffff;
            border-radius: 1rem;
            padding: 1.5rem;
            box-shadow: 0 20px 27px 0 rgba(0,0,0,0.05);
            margin-bottom: 1.5rem;
        }
        
        [data-testid="stMetricValue"] {
            color: #344767;
            font-size: 1.5rem;
            font-weight: 700;
        }
        
        [data-testid="stMetricLabel"] {
            color: #7b809a;
            font-size: 0.875rem;
            font-weight: 400;
            text-transform: uppercase;
        }
        </style>
    """, unsafe_allow_html=True)


def render_material_stats_card(label, value, icon, gradient="purple", footer_text=None, footer_icon=None):
    """Render Material Dashboard style stats card with floating icon"""
    
    gradient_colors = {
        "purple": "linear-gradient(195deg, #42424a 0%, #191919 100%)",
        "success": "linear-gradient(195deg, #66bb6a 0%, #43a047 100%)",
        "info": "linear-gradient(195deg, #49a3f1 0%, #1A73E8 100%)",
        "warning": "linear-gradient(195deg, #ffa726 0%, #fb8c00 100%)",
        "danger": "linear-gradient(195deg, #ef5350 0%, #e53935 100%)"
    }
    
    footer_html = ""
    if footer_text:
        footer_icon_html = f"{footer_icon} " if footer_icon else ""
        footer_html = f"""
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.05); 
                        color: #7b809a; font-size: 0.875rem;">
                {footer_icon_html}{footer_text}
            </div>
        """
    
    st.markdown(f"""
        <div class="material-card" style="position: relative; padding-top: 2.5rem;">
            <div style="position: absolute; top: -20px; left: 20px; width: 64px; height: 64px; 
                        border-radius: 0.75rem; display: flex; align-items: center; 
                        justify-content: center; font-size: 1.5rem; color: white;
                        background: {gradient_colors.get(gradient, gradient_colors['purple'])};
                        box-shadow: 0 4px 20px 0 rgba(0,0,0,0.14);">
                {icon}
            </div>
            <div style="margin-left: 90px; margin-top: 0.5rem;">
                <div style="color: #7b809a; font-size: 0.875rem; font-weight: 400; 
                            text-transform: uppercase; margin-bottom: 0.25rem;">
                    {label}
                </div>
                <div style="color: #344767; font-size: 1.5rem; font-weight: 700;">
                    {value}
                </div>
            </div>
            {footer_html}
        </div>
    """, unsafe_allow_html=True)


def render_material_page_header(title, subtitle=None):
    """Render Material Dashboard page header"""
    
    subtitle_html = ""
    if subtitle:
        subtitle_html = f'<p style="color: #7b809a; font-size: 1rem; margin-top: 0.5rem;">{subtitle}</p>'
    
    st.markdown(f"""
        <div style="margin-bottom: 2rem;">
            <h1 style="color: #344767; font-weight: 700; margin-bottom: 0.5rem;">
                {title}
            </h1>
            {subtitle_html}
        </div>
    """, unsafe_allow_html=True)


def render_material_card(title=None, content="", icon=None):
    """Render Material Dashboard style card"""
    
    title_html = ""
    if title:
        icon_html = f"{icon} " if icon else ""
        title_html = f"""
            <h3 style="color: #344767; font-weight: 600; margin-bottom: 1rem;">
                {icon_html}{title}
            </h3>
        """
    
    st.markdown(f"""
        <div class="material-card">
            {title_html}
            <div>{content}</div>
        </div>
    """, unsafe_allow_html=True)


def render_material_badge(text, type="info"):
    """Render Material badge"""
    
    colors = {
        "success": "linear-gradient(195deg, #66bb6a 0%, #43a047 100%)",
        "info": "linear-gradient(195deg, #49a3f1 0%, #1A73E8 100%)",
        "warning": "linear-gradient(195deg, #ffa726 0%, #fb8c00 100%)",
        "danger": "linear-gradient(195deg, #ef5350 0%, #e53935 100%)"
    }
    
    return f"""<span style="display: inline-block; padding: 0.35em 0.65em; font-size: 0.75em; 
                font-weight: 700; color: #fff; text-align: center; border-radius: 0.375rem;
                background: {colors.get(type, colors['info'])};">{text}</span>"""
EOFMATERIAL

echo -e "${GREEN}✓${NC} material_ui.py создан"

# Создаем material_theme.py
echo ""
echo -e "${BLUE}📊 Создание material_theme.py...${NC}"

cat > material_ui/visualization/material_theme.py << 'EOFTHEME'
"""
Material Dashboard Theme for Plotly Charts
"""

import plotly.graph_objects as go

class MaterialChartTheme:
    """Material Dashboard color scheme"""
    
    PURPLE = "#9c27b0"
    SUCCESS = "#4caf50"
    INFO = "#00bcd4"
    WARNING = "#ff9800"
    DANGER = "#f44336"
    DARK = "#344767"
    GRAY = "#7b809a"


def get_material_layout(title=None, height=400):
    """Get Material Dashboard layout for Plotly charts"""
    
    return {
        "font": {
            "family": "Roboto, sans-serif",
            "color": MaterialChartTheme.DARK
        },
        "plot_bgcolor": "rgba(0,0,0,0)",
        "paper_bgcolor": "rgba(0,0,0,0)",
        "height": height,
        "title": {
            "text": title,
            "font": {"size": 18, "color": MaterialChartTheme.DARK},
            "x": 0
        } if title else {},
        "xaxis": {
            "showgrid": False,
            "color": MaterialChartTheme.GRAY
        },
        "yaxis": {
            "showgrid": True,
            "gridcolor": "rgba(0,0,0,0.05)",
            "color": MaterialChartTheme.GRAY
        }
    }


def create_material_figure(title=None, height=400):
    """Create Plotly figure with Material Dashboard styling"""
    
    fig = go.Figure()
    fig.update_layout(get_material_layout(title=title, height=height))
    return fig
EOFTHEME

echo -e "${GREEN}✓${NC} material_theme.py создан"

# Обновляем docker-compose.yml
echo ""
echo -e "${BLUE}⚙️  Обновление docker-compose.yml...${NC}"

# Создаем бэкап
cp docker-compose.yml docker-compose.yml.backup
echo -e "${GREEN}✓${NC} Создан бэкап: docker-compose.yml.backup"

# Проверяем есть ли уже наши volumes
if grep -q "material_ui/components" docker-compose.yml; then
    echo -e "${YELLOW}⚠️  Volumes уже добавлены в docker-compose.yml${NC}"
else
    # Добавляем volumes после строки с pages
    sed -i.tmp '/- \.\/pages:/a\
      - ./material_ui/components:/home/dashboard/frontend/components\
      - ./material_ui/visualization:/home/dashboard/frontend/visualization
' docker-compose.yml
    
    rm -f docker-compose.yml.tmp
    echo -e "${GREEN}✓${NC} docker-compose.yml обновлен"
fi

# Создаем пример страницы
echo ""
echo -e "${BLUE}📄 Создание примера страницы...${NC}"

cat > pages/material_example.py << 'EOFPAGE'
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
EOFPAGE

echo -e "${GREEN}✓${NC} Создан пример страницы: pages/material_example.py"

# Финальные инструкции
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Установка завершена!                      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} Material UI компоненты установлены"
echo -e "${GREEN}✓${NC} docker-compose.yml обновлен"
echo -e "${GREEN}✓${NC} Пример страницы создан"
echo ""
echo -e "${YELLOW}📋 Следующие шаги:${NC}"
echo ""
echo -e "1️⃣  Перезапустите dashboard:"
echo -e "   ${BLUE}docker-compose restart dashboard${NC}"
echo ""
echo -e "2️⃣  Откройте в браузере:"
echo -e "   ${BLUE}http://localhost:8501${NC}"
echo ""
echo -e "3️⃣  Обновите существующие страницы в ${BLUE}pages/${NC}"
echo -e "   Добавьте в начало файла:"
echo -e "   ${BLUE}from frontend.components.material_ui import inject_material_css${NC}"
echo -e "   ${BLUE}inject_material_css()${NC}"
echo ""
echo -e "4️⃣  Посмотрите пример:"
echo -e "   Страница ${BLUE}material_example.py${NC} покажет как использовать компоненты"
echo ""
echo -e "${GREEN}🎉 Готово! Наслаждайтесь Material Dashboard!${NC}"
echo ""
