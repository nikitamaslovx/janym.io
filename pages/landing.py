import random
from datetime import datetime, timedelta

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

from frontend.st_utils import initialize_st_page
from frontend.components.material_ui import (
    inject_material_css,
    render_material_page_header,
    render_material_stats_card,
    render_material_card,
    render_material_badge
)

initialize_st_page(
    layout="wide",
    show_readme=False
)

# Apply Material Dashboard CSS
inject_material_css()

# Hero Section
render_material_page_header(
    "🤖 Hummingbot Dashboard",
    "Your Command Center for Algorithmic Trading Excellence"
)

# Generate sample data for demonstration
def generate_sample_data():
    """Generate sample trading data for visualization"""
    dates = pd.date_range(start=datetime.now() - timedelta(days=30), end=datetime.now(), freq='D')
    
    # Sample portfolio performance
    portfolio_values = []
    base_value = 10000
    for i in range(len(dates)):
        change = random.uniform(-0.02, 0.03)  # -2% to +3% daily change
        base_value *= (1 + change)
        portfolio_values.append(base_value)
    
    return pd.DataFrame({
        'date': dates,
        'portfolio_value': portfolio_values,
        'daily_return': [random.uniform(-0.05, 0.08) for _ in range(len(dates))]
    })

# Quick Stats Dashboard
st.markdown("## 📊 Live Dashboard Overview")

# Mock data warning
st.warning("""
⚠️ **Demo Data Notice**: The metrics, charts, and statistics shown below are simulated/mocked data for demonstration purposes. 
This showcases how real trading data would be presented in the dashboard once connected to live trading bots.
""")

col1, col2, col3, col4 = st.columns(4)

with col1:
    render_material_stats_card(
        label="Active Bots",
        value="3",
        icon="🔄",
        gradient="success",
        footer_text="Currently Trading",
        footer_icon="🤖"
    )

with col2:
    render_material_stats_card(
        label="Total Portfolio",
        value="$12,847",
        icon="💰",
        gradient="info",
        footer_text="+2.3% Today",
        footer_icon="📈"
    )

with col3:
    render_material_stats_card(
        label="Win Rate",
        value="74.2%",
        icon="📈",
        gradient="success",
        footer_text="Last 30 Days",
        footer_icon="🎯"
    )

with col4:
    render_material_stats_card(
        label="Total Trades",
        value="1,247",
        icon="⚡",
        gradient="warning",
        footer_text="This Month",
        footer_icon="🔄"
    )

st.divider()

# Performance Chart
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("### 📈 Portfolio Performance (30 Days)")
    
    # Generate and display sample performance chart
    df = generate_sample_data()
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=df['date'],
        y=df['portfolio_value'],
        mode='lines+markers',
        line=dict(color='#9c27b0', width=3),
        fill='tonexty',
        fillcolor='rgba(156, 39, 176, 0.1)',
        name='Portfolio Value',
        marker=dict(size=6, color='#9c27b0')
    ))
    
    fig.update_layout(
        template='plotly_white',
        height=400,
        showlegend=False,
        margin=dict(l=0, r=0, t=10, b=0),
        xaxis=dict(showgrid=False),
        yaxis=dict(showgrid=True, gridcolor='rgba(0,0,0,0.05)'),
        plot_bgcolor='rgba(0,0,0,0)',
        paper_bgcolor='rgba(0,0,0,0)',
        font=dict(family='Roboto, sans-serif', color='#344767')
    )
    
    st.plotly_chart(fig, use_container_width=True)

with col2:
    st.markdown("### 🎯 Strategy Status")
    
    strategies = [
        {"name": "Market Making", "status": "active", "pnl": "+$342"},
        {"name": "Arbitrage", "status": "active", "pnl": "+$156"},
        {"name": "Grid Trading", "status": "active", "pnl": "+$89"},
        {"name": "DCA Bot", "status": "inactive", "pnl": "+$234"},
    ]
    
    for strategy in strategies:
        status_type = "success" if strategy["status"] == "active" else "danger"
        status_icon = "🟢" if strategy["status"] == "active" else "🔴"
        badge = render_material_badge(f"{status_icon} {strategy['status'].title()}", status_type)
        
        st.markdown(f"""
        <div class="material-card" style="margin: 0.5rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong style="color: #344767;">{strategy['name']}</strong><br>
                    {badge}
                </div>
                <div style="text-align: right;">
                    <span style="color: #4CAF50; font-weight: bold; font-size: 1.1rem;">{strategy['pnl']}</span>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

st.divider()

# Feature Showcase
st.markdown("## 🚀 Platform Features")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("""
    <div class="material-card">
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem;">🎯</div>
            <h3 style="color: #344767; margin: 0.5rem 0;">Strategy Development</h3>
        </div>
        <ul style="list-style: none; padding: 0; color: #7b809a;">
            <li style="padding: 0.25rem 0;">✨ Visual Strategy Builder</li>
            <li style="padding: 0.25rem 0;">🔧 Advanced Configuration</li>
            <li style="padding: 0.25rem 0;">📝 Custom Parameters</li>
            <li style="padding: 0.25rem 0;">🧪 Testing Environment</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="material-card">
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem;">📊</div>
            <h3 style="color: #344767; margin: 0.5rem 0;">Analytics & Insights</h3>
        </div>
        <ul style="list-style: none; padding: 0; color: #7b809a;">
            <li style="padding: 0.25rem 0;">📈 Real-time Performance</li>
            <li style="padding: 0.25rem 0;">🔍 Advanced Backtesting</li>
            <li style="padding: 0.25rem 0;">📋 Detailed Reports</li>
            <li style="padding: 0.25rem 0;">🎨 Interactive Charts</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

with col3:
    st.markdown("""
    <div class="material-card">
        <div style="text-align: center; margin-bottom: 1rem;">
            <div style="font-size: 3rem;">⚡</div>
            <h3 style="color: #344767; margin: 0.5rem 0;">Live Trading</h3>
        </div>
        <ul style="list-style: none; padding: 0; color: #7b809a;">
            <li style="padding: 0.25rem 0;">🤖 Automated Execution</li>
            <li style="padding: 0.25rem 0;">📡 Real-time Monitoring</li>
            <li style="padding: 0.25rem 0;">🛡️ Risk Management</li>
            <li style="padding: 0.25rem 0;">🔔 Smart Alerts</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

st.divider()

# Quick Actions
st.markdown("## ⚡ Quick Actions")

# Alert for mocked navigation
st.info("ℹ️ **Note**: This is a mocked landing page. The Quick Actions buttons below are for demonstration purposes and the page navigation is not functional.")

col1, col2, col3, col4 = st.columns(4)

with col1:
    if st.button("🚀 Deploy Strategy", use_container_width=True, type="primary"):
        st.error("🚫 Navigation unavailable - This is a mocked landing page for demonstration purposes.")

with col2:
    if st.button("📊 View Performance", use_container_width=True):
        st.error("🚫 Navigation unavailable - This is a mocked landing page for demonstration purposes.")

with col3:
    if st.button("🔍 Backtesting", use_container_width=True):
        st.error("🚫 Navigation unavailable - This is a mocked landing page for demonstration purposes.")

with col4:
    if st.button("🗃️ Archived Bots", use_container_width=True):
        st.error("🚫 Navigation unavailable - This is a mocked landing page for demonstration purposes.")

st.divider()

# Community & Resources
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("### 🎬 Learn & Explore")
    
    st.video("https://youtu.be/7eHiMPRBQLQ?si=PAvCq0D5QDZz1h1D")

with col2:
    st.markdown("### 💬 Join Our Community")
    
    st.markdown("""
    <div class="material-card" style="background: linear-gradient(195deg, #9c27b0 0%, #7b1fa2 100%); color: white;">
        <h4 style="color: white; margin-top: 0;">🌟 Connect with Traders</h4>
        <p style="color: rgba(255,255,255,0.9);">Join thousands of algorithmic traders sharing strategies and insights!</p>
        <br>
        <a href="https://discord.gg/hummingbot" target="_blank" 
           style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; 
                  border-radius: 8px; text-decoration: none; color: white; font-weight: bold;
                  display: inline-block; margin: 0.25rem 0;">
           💬 Join Discord
        </a>
        <br>
        <a href="https://github.com/hummingbot/dashboard" target="_blank"
           style="background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; 
                  border-radius: 8px; text-decoration: none; color: white; font-weight: bold;
                  display: inline-block; margin: 0.25rem 0;">
           🐛 Report Issues
        </a>
    </div>
    """, unsafe_allow_html=True)

# Footer stats
st.markdown("---")
col1, col2, col3, col4 = st.columns(4)

with col1:
    render_material_stats_card(
        label="Global Users",
        value="10,000+",
        icon="🌍",
        gradient="info"
    )

with col2:
    render_material_stats_card(
        label="Exchanges",
        value="20+",
        icon="💱",
        gradient="success"
    )

with col3:
    render_material_stats_card(
        label="Daily Volume",
        value="$2.5M+",
        icon="🔄",
        gradient="warning"
    )

with col4:
    render_material_stats_card(
        label="GitHub Stars",
        value="7,800+",
        icon="⭐",
        gradient="danger"
    )
