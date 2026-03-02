#!/usr/bin/env python3
"""
fix-cart.py - Auto-patch script for Schecter cart functionality
Run with: python fix-cart.py
"""

import os
import re
import shutil
from datetime import datetime
from pathlib import Path

# ============ CONFIGURATION ============
CONFIG = {
    'product_pages': [
        'synyster-custom.html',
        'custom-shop.html',
        'guitar-models.html'  # Add other product pages here
    ],
    'main_js': 'main.js',
    'cart_html': 'cart.html',
    'backup_dir': '.cart-fix-backup'
}

def backup_file(filepath):
    """Create backup of file"""
    if not os.path.exists(filepath):
        return None
    
    backup_path = os.path.join(CONFIG['backup_dir'], filepath)
    os.makedirs(os.path.dirname(backup_path), exist_ok=True)
    shutil.copy2(filepath, backup_path)
    print(f"✅ Backed up: {filepath} → {backup_path}")
    return backup_path

def fix_price_attribute(html):
    """Fix data-price values: remove commas, ensure numeric"""
    def replace_price(match):
        price_str = match.group(1).replace(',', '').strip()
        try:
            num = float(price_str)
            return f'data-price="{num:.2f}"'
        except ValueError:
            return match.group(0)  # Keep original if can't parse
    
    return re.sub(r'data-price="([^"]*)"', replace_price, html)

def fix_image_path(html):
    """Fix data-image paths: remove 'images/' prefix if incorrect"""
    return re.sub(r'data-image="images/([^"]*)"', r'data-image="\1"', html)

def fix_add_to_cart_buttons(html):
    """Apply all button fixes"""
    html = fix_price_attribute(html)
    html = fix_image_path(html)
    return html

def get_missing_js_code():
    """Return the JavaScript code to inject"""
    return f'''
// ============ AUTO-ADDED: Cart Event Listeners & Helpers ============
// Added by fix-cart.py on {datetime.now().isoformat()}

(function() {{
  if (window._cartListenersAttached) return;
  window._cartListenersAttached = true;

  function updateCartBadge() {{
    try {{
      const cart = JSON.parse(localStorage.getItem('userCart')) || [];
      const badges = document.querySelectorAll('.cart-count, #cart-count, [data-cart-badge]');
      const totalItems = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
      
      badges.forEach(badge => {{
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
      }});
    }} catch(e) {{
      console.warn('updateCartBadge error:', e);
    }}
  }}

  function attachCartListeners() {{
    const buttons = document.querySelectorAll('.add-to-cart, button[data-id]');
    
    buttons.forEach(btn => {{
      if (btn._cartListenerAttached) return;
      btn._cartListenerAttached = true;
      
      btn.addEventListener('click', function(e) {{
        e.preventDefault();
        e.stopPropagation();
        
        const id = this.dataset.id;
        const name = this.dataset.name;
        const price = parseFloat(this.dataset.price);
        const image = this.dataset.image;
        const quantity = parseInt(this.dataset.quantity) || 1;
        
        if (!id || !name || isNaN(price)) {{
          console.warn('Invalid cart data:', {{ id, name, price }});
          return;
        }}
        
        if (typeof addToCart === 'function') {{
          addToCart(id, name, price, image, quantity);
          updateCartBadge();
          
          const originalText = this.textContent;
          this.textContent = '✓ Added!';
          this.disabled = true;
          setTimeout(() => {{
            this.textContent = originalText;
            this.disabled = false;
          }}, 1500);
        }} else {{
          console.error('addToCart function not found!');
        }}
      }});
    }});
  }}

  function renderCartDisplay() {{
    if (typeof window.renderCartDisplay === 'function') {{
      window.renderCartDisplay();
    }}
  }}

  if (document.readyState === 'loading') {{
    document.addEventListener('DOMContentLoaded', () => {{
      attachCartListeners();
      updateCartBadge();
      renderCartDisplay();
    }});
  }} else {{
    attachCartListeners();
    updateCartBadge();
    renderCartDisplay();
  }}

  window._reinitCart = function() {{
    attachCartListeners();
    updateCartBadge();
  }};
}})();
// ============ END AUTO-ADDED CODE ============
'''

def fix_main_js(content):
    """Add missing JS code to main.js"""
    if 'AUTO-ADDED: Cart Event Listeners' in content:
        print("⚠️ main.js already contains auto-fix code, skipping injection")
        return content
    return content.rstrip() + '\n\n' + get_missing_js_code()

def fix_script_tags(html):
    """Remove potentially conflicting cartLogic.js script tag"""
    return re.sub(r'<script\s+src=["\']cartLogic\.js["\']></script>\s*', '', html, flags=re.IGNORECASE)

def main():
    print('🔧 Starting Schecter cart auto-fix...\n')
    changes_made = 0
    
    # Fix product HTML pages
    print('📄 Fixing product HTML pages...')
    for file in CONFIG['product_pages']:
        if not os.path.exists(file):
            print(f"⚠️  Skipping (not found): {file}")
            continue
        
        backup_file(file)
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        original = content
        
        content = fix_add_to_cart_buttons(content)
        content = fix_script_tags(content)
        
        if content != original:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {file}")
            changes_made += 1
        else:
            print(f"ℹ️  No changes needed: {file}")
    
    # Fix main.js
    print('\n📜 Fixing main.js...')
    if os.path.exists(CONFIG['main_js']):
        backup_file(CONFIG['main_js'])
        with open(CONFIG['main_js'], 'r', encoding='utf-8') as f:
            content = f.read()
        original = content
        
        content = fix_main_js(content)
        
        if content != original:
            with open(CONFIG['main_js'], 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {CONFIG['main_js']}")
            changes_made += 1
        else:
            print(f"ℹ️  No changes needed: {CONFIG['main_js']}")
    else:
        print(f"❌ {CONFIG['main_js']} not found! Creating basic version...")
        with open(CONFIG['main_js'], 'w', encoding='utf-8') as f:
            f.write(f"// main.js - Cart functionality\n{get_missing_js_code()}")
        changes_made += 1
    
    # Check other HTML files
    print('\n🔍 Checking other HTML files...')
    all_html = [f for f in os.listdir('.') if f.endswith('.html') and not f.startswith('fix-')]
    
    for file in all_html:
        if file in CONFIG['product_pages'] or file == CONFIG['cart_html']:
            continue
        
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if 'add-to-cart' in content or 'data-price=' in content:
            backup_file(file)
            original = content
            content = fix_add_to_cart_buttons(content)
            content = fix_script_tags(content)
            
            if content != original:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"✅ Fixed: {file}")
                changes_made += 1
    
    # Summary
    print('\n' + '='*50)
    print(f"✨ Auto-fix complete! Changes made: {changes_made}")
    print(f"📦 Backups saved in: ./{CONFIG['backup_dir']}/")
    print('\n🔄 Next steps:')
    print('1. Clear your browser cache or hard-refresh (Ctrl+F5)')
    print('2. Open browser DevTools → Console to check for errors')
    print('3. Test "Add to Cart" on a product page')
    print('4. Visit cart.html to verify items appear')
    print('\n🔙 To rollback changes:')
    print(f'   cp {CONFIG["backup_dir"]}/*/*.html .  # Restore HTML')
    print(f'   cp {CONFIG["backup_dir"]}/{CONFIG["main_js"]} .  # Restore JS')
    print('='*50)

if __name__ == '__main__':
    main()