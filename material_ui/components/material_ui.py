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
