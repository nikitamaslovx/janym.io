#!/bin/bash

echo "🎨 Обновление всех страниц..."

# Обновляем каждую страницу
find pages -name "*.py" -type f ! -name "__init__.py" -exec sh -c '
    file="$1"
    if ! grep -q "inject_material_css" "$file"; then
        echo "Обновляем: $file"
        # Добавляем импорты в начало после существующих импортов
        sed -i "/^import streamlit as st/a\\
try:\\
    from frontend.components.material_ui import inject_material_css, inject_material_sidebar_css\\
    inject_material_css()\\
    inject_material_sidebar_css()\\
except:\\
    pass" "$file"
    fi
' sh {} \;

echo "✅ Готово!"
