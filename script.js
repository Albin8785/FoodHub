const app = {
    data: {
        currentRole: null, 
        loginRole: 'customer',
        riderStatus: 'Online',
        menu: [
            { id: 1, name: "Burger", price: 14.50, cat: "Burger", type: "non-veg", group: "food", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80" },
            { id: 2, name: "Pizza", price: 12.00, cat: "Pizza", type: "non-veg", group: "food", img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80" },
            { id: 3, name: "Salad", price: 9.50, cat: "Sides", type: "veg", group: "food", img: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80" },
            { id: 4, name: "Cola", price: 3.00, cat: "Drinks", type: "veg", group: "drink", img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80" },
            { id: 5, name: "Pepsi", price: 2.00, cat: "Drinks", type: "veg", group: "drink", img: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?q=80&w=1229&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }
        ],
        menuFilter: 'all',
        cart: [],
        orders: [],
        tables: Array.from({length:10}, (_,i)=>({id:i+1, status:'free'})),
        fleet: [
            {id: 101, name: "Albin", status: "Online", isMe: true},
            {id: 102, name: "Joseph", status: "Busy", isMe: false},
            {id: 103, name: "David", status: "Offline", isMe: false}
        ],
        loyaltyPoints: 120,
        selectedPayment: null
    },

    init() {
        this.navigate('login');
        this.switchAdminTab('orders');
    },

    // --- AUTH ---
    setLoginRole(role) {
        this.data.loginRole = role;
        document.querySelectorAll('.role-btn').forEach(btn => {
            if (btn.dataset.role === role) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },

    login(e) {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        const role = this.data.loginRole;

        let auth = false;
        if (role === 'admin' && user === 'admin' && pass === 'admin123') auth = true;
        else if (role === 'rider' && user === 'rider' && pass === 'rider123') auth = true;
        else if (role === 'customer' && user === 'user' && pass === 'user123') auth = true;

        if (auth) {
            this.data.currentRole = role;
            this.updateNav(true, user, role);
            this.navigate(role);
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
            this.showToast(`Welcome back, ${user}!`);
        } else {
            this.showToast('Invalid credentials', 'error');
        }
    },

    loginQR() {
        this.data.currentRole = 'takeaway';
        this.updateNav(true, 'Guest (Takeaway)', 'takeaway');
        this.navigate('customer'); 
        this.showToast('Scanned QR: Welcome to Takeaway');
    },

    logout() {
        this.data.currentRole = null;
        this.updateNav(false);
        this.navigate('login');
        this.showToast('Logged out');
    },

    updateNav(isLoggedIn, user, role) {
        const display = document.getElementById('user-display');
        const btn = document.getElementById('btn-logout');
        if(isLoggedIn){ display.innerText = user; display.classList.remove('hide'); btn.classList.remove('hide'); }
        else { display.classList.add('hide'); btn.classList.add('hide'); }
    },

    navigate(view) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hide'));
        const target = document.getElementById(`view-${view}`);
        if(target) target.classList.remove('hide');
        
        if(view === 'customer') { this.renderMenu(); this.renderCustomerTables(); }
        if(view === 'admin') { this.renderAdminMenu(); this.renderTables(); this.renderFleet(); }
        if(view === 'rider') this.renderRider();
    },

    // --- CUSTOMER ---
    toggleCustomerView(subview) {
        document.querySelectorAll('.customer-subview').forEach(el => el.classList.add('hide'));
        document.getElementById(`customer-view-${subview}`).classList.remove('hide');
        
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        if(subview === 'order') document.getElementById('btn-cust-order').classList.add('active');
        else {
            document.getElementById('btn-cust-book').classList.add('active');
            this.renderCustomerTables();
        }
    },

    setMenuFilter(type) {
        this.data.menuFilter = type;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if(btn.dataset.filter === type) btn.classList.add('active');
            else btn.classList.remove('active');
        });
        this.renderMenu();
    },

    renderMenu() {
        const foodGrid = document.getElementById('customer-menu-food');
        const drinkGrid = document.getElementById('customer-menu-drinks');
        
        const filteredItems = this.data.menu.filter(item => {
            if(this.data.menuFilter === 'all') return true;
            return item.type === this.data.menuFilter;
        });

        const foodList = filteredItems.filter(item => item.group === 'food');
        const drinkList = filteredItems.filter(item => item.group === 'drink');

        const createCard = (item) => {
            const indicator = item.type === 'veg' 
                ? '<div class="veg-icon" style="border: 1px solid green;"><div style="width: 8px; height: 8px; background: green; border-radius: 50%;"></div></div>'
                : '<div class="veg-icon" style="border: 1px solid red;"><div style="width: 8px; height: 8px; background: red; border-radius: 50%;"></div></div>';

            return `
            <div class="menu-card">
                <div class="menu-img-wrap">
                    <img src="${item.img}">
                    ${indicator}
                    <span class="price-tag">$${item.price.toFixed(2)}</span>
                </div>
                <h4 style="font-weight: bold;">${item.name}</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted); text-transform: capitalize;">${item.type} • ${item.cat}</p>
                <button onclick="app.addToCart(${item.id})" class="btn-add">Add +</button>
            </div>`;
        };

        if(foodList.length > 0) {
            document.getElementById('section-food').classList.remove('hide');
            foodGrid.innerHTML = foodList.map(createCard).join('');
        } else {
            document.getElementById('section-food').classList.add('hide');
        }

        if(drinkList.length > 0) {
            document.getElementById('section-drinks').classList.remove('hide');
            drinkGrid.innerHTML = drinkList.map(createCard).join('');
        } else {
            document.getElementById('section-drinks').classList.add('hide');
        }

        const container = document.getElementById('customer-menu-container');
        if (foodList.length === 0 && drinkList.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 2rem;">No items found for this preference.</div>';
        }
        
        document.getElementById('cust-points').innerText = this.data.loyaltyPoints;
    },

    addToCart(id) {
        const item = this.data.menu.find(m=>m.id===id);
        const existing = this.data.cart.find(c=>c.id===id);
        existing ? existing.qty++ : this.data.cart.push({...item, qty:1});
        this.updateCart();
        this.showToast(`Added ${item.name}`);
    },

    updateCart() {
        const container = document.getElementById('cart-items');
        if(!this.data.cart.length) { container.innerHTML = '<div style="text-align:center; color:#9ca3af; padding:1rem;">Your cart is empty</div>'; document.getElementById('cart-total').innerText = '$0.00'; document.getElementById('cart-count').innerText = '0'; return; }
        let total = 0;
        container.innerHTML = this.data.cart.map(c => {
            total += c.price * c.qty;
            const typeColor = c.type === 'veg' ? 'green' : 'red';
            return `<div class="cart-row" style="background: #f9fafb; padding: 0.5rem; border-radius: 4px; align-items: center;">
                    <div>
                        <p style="font-weight: bold; font-size: 0.9rem;">
                            <span style="color:${typeColor}">●</span> ${c.name}
                        </p>
                        <p style="font-size: 0.75rem; color: #6b7280;">$${c.price} x ${c.qty}</p>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="app.modQty(${c.id}, -1)" style="width: 24px; height: 24px; border: 1px solid #ddd; background: white; cursor: pointer;">-</button>
                        <button onclick="app.modQty(${c.id}, 1)" style="width: 24px; height: 24px; border: 1px solid #ddd; background: white; cursor: pointer;">+</button>
                    </div>
                </div>`;
        }).join('');
        document.getElementById('cart-total').innerText = '$' + total.toFixed(2);
        document.getElementById('cart-count').innerText = this.data.cart.reduce((a,b)=>a+b.qty,0);
    },

    modQty(id, d) {
        const item = this.data.cart.find(c=>c.id===id);
        if(item) { item.qty += d; if(item.qty<=0) this.data.cart = this.data.cart.filter(c=>c.id!==id); }
        this.updateCart();
    },

    renderCustomerTables() {
        const grid = document.getElementById('customer-tables-grid');
        grid.innerHTML = this.data.tables.map(t => {
            let style = 'background: #dcfce7; color: #15803d; border: 2px solid #bbf7d0; cursor: pointer;';
            let icon = 'fa-check';
            let action = `onclick="app.bookTable(${t.id})"`;
            
            if(t.status === 'reserved') { style = 'background: #fef9c3; color: #a16207; border: 2px solid #fef08a; cursor: not-allowed; opacity: 0.7;'; icon = 'fa-clock'; action = ''; }
            if(t.status === 'occupied') { style = 'background: #fee2e2; color: #b91c1c; border: 2px solid #fecaca; cursor: not-allowed; opacity: 0.7;'; icon = 'fa-user'; action = ''; }

            return `
                <div ${action} style="${style} padding: 1rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90px;">
                    <span style="font-size: 1.1rem; font-weight: bold;">T-${t.id}</span>
                    <div style="font-size: 0.75rem; font-weight: bold; text-transform: uppercase; margin-top: 5px;"><i class="fa-solid ${icon}"></i> ${t.status}</div>
                </div>
            `;
        }).join('');
    },

    bookTable(id) {
        if(!confirm(`Confirm reservation for Table ${id}?`)) return;
        const t = this.data.tables.find(x => x.id === id);
        if(t) {
            t.status = 'reserved';
            this.renderCustomerTables();
            this.showToast(`Table ${id} Booked Successfully`);
        }
    },

    showCheckoutModal() {
        if(!this.data.cart.length) return this.showToast('Cart is empty', 'error');
        const total = this.data.cart.reduce((a,b)=>a+(b.price*b.qty),0);
        const tax = total * 0.1;
        document.getElementById('modal-subtotal').innerText = '$'+total.toFixed(2);
        document.getElementById('modal-tax').innerText = '$'+tax.toFixed(2);
        document.getElementById('modal-total').innerText = '$'+(total+tax).toFixed(2);
        document.getElementById('modal-points').innerText = Math.floor((total+tax)*5);
        
        document.getElementById('checkout-address').value = '';
        document.getElementById('qr-display').classList.add('hide');
        this.data.selectedPayment = null;

        const addrContainer = document.getElementById('address-container');
        if(this.data.currentRole === 'takeaway') {
            addrContainer.classList.add('hide');
        } else {
            addrContainer.classList.remove('hide');
        }

        document.getElementById('modal-checkout').classList.remove('hide');
        document.getElementById('modal-checkout').classList.add('modal-overlay'); // Ensure flex display
    },

    selectPayment(type) {
        this.data.selectedPayment = type;
        if(type === 'qr') document.getElementById('qr-display').classList.remove('hide');
        else document.getElementById('qr-display').classList.add('hide');
        
        // Visual feedback
        document.getElementById('btn-cash').style.borderColor = type === 'cash' ? 'var(--secondary)' : 'var(--border)';
        document.getElementById('btn-qr').style.borderColor = type === 'qr' ? 'var(--secondary)' : 'var(--border)';
    },

    confirmOrder() {
        const isTakeaway = this.data.currentRole === 'takeaway';
        const addressInput = document.getElementById('checkout-address').value;
        
        if(!isTakeaway && !addressInput.trim()) return alert("Please enter delivery address.");
        if(!this.data.selectedPayment) return alert("Please select a payment method.");
        
        const total = parseFloat(document.getElementById('modal-total').innerText.replace('$',''));
        
        const order = {
            id: Math.floor(Math.random()*9000)+1000,
            items: [...this.data.cart],
            total: total,
            status: 'Pending',
            payment: this.data.selectedPayment === 'qr' ? 'PAID (QR)' : (isTakeaway ? 'Counter Pay' : 'COD'),
            riderStatus: isTakeaway ? 'None' : 'Searching', 
            address: isTakeaway ? 'Takeaway / Walk-in' : addressInput,
            type: isTakeaway ? 'takeaway' : 'delivery'
        };
        
        this.data.orders.push(order);
        this.data.cart = [];
        this.data.loyaltyPoints += parseInt(document.getElementById('modal-points').innerText);
        this.updateCart();
        document.getElementById('modal-checkout').classList.add('hide');
        this.showToast(`Order #${order.id} Placed!`);
    },

    // --- ADMIN ---
    switchAdminTab(tab) {
        document.querySelectorAll('.admin-panel').forEach(el => el.classList.add('hide'));
        document.getElementById(`tab-${tab}`).classList.remove('hide');
        document.querySelectorAll('.admin-btn').forEach(btn => btn.dataset.tab === tab ? btn.classList.add('active') : btn.classList.remove('active'));
        if(tab==='orders') this.updateAdminOrders();
    },
    
    updateAdminOrders() {
            const active = this.data.orders.filter(o=>o.status==='Pending' || o.status==='Cooking');
            const ready = this.data.orders.filter(o=>o.status==='Ready' || o.status==='Delivered'); 
            
            const card = (o, act) => `
            <div class="order-card-admin">
                <div class="order-header">
                    <span>#${o.id}</span>
                    <span>$${o.total.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span style="font-size: 0.75rem; color: #6b7280;">${o.items.length} items</span>
                    <span class="status-badge ${o.type==='takeaway' ? 'badge-takeaway' : (o.status==='Pending'?'badge-pending':'badge-ready')}">
                        ${o.type === 'takeaway' ? 'Takeaway' : o.status}
                    </span>
                </div>
                <details style="font-size: 0.75rem; margin-bottom: 0.5rem;">
                    <summary style="cursor: pointer; color: var(--blue); font-weight: bold;">View Details</summary>
                    <div style="margin-top: 5px; padding: 5px; background: white; border: 1px solid var(--border); border-radius: 4px;">
                        <p><strong>Type:</strong> ${o.type ? o.type.toUpperCase() : 'DELIVERY'}</p>
                        <p><strong>Address:</strong> ${o.address}</p>
                        <ul style="padding-left: 1rem; margin-top: 5px; color: #6b7280;">${o.items.map(i=>`<li>${i.qty}x ${i.name}</li>`).join('')}</ul>
                    </div>
                </details>
                ${act}
            </div>`;

            const getActionBtn = (o) => {
            if(o.status === 'Pending') {
                return `<button onclick="app.setStatus(${o.id}, 'Cooking')" class="btn-action btn-cook">Approve & Cook</button>`;
            } else {
                return `<button onclick="app.setStatus(${o.id}, 'Ready')" class="btn-action btn-ready">Mark Ready</button>`;
            }
            };
            
            const getReadyStatus = (o) => {
                if (o.type === 'takeaway') {
                    return `<span style="display: block; text-align: center; color: var(--success); font-size: 0.75rem; font-weight: bold; border: 1px solid #bbf7d0; background: #f0fdf4; padding: 4px; border-radius: 4px;">✅ Order Completed</span>`;
                } else {
                    return `<span style="display: block; text-align: center; color: var(--success); font-size: 0.75rem; font-weight: bold; border: 1px solid #bbf7d0; background: #f0fdf4; padding: 4px; border-radius: 4px;">Waiting Rider (${o.riderStatus})</span>`;
                }
            };
            
            document.getElementById('admin-orders-pending').innerHTML = active.length ? active.map(o => card(o, getActionBtn(o))).join('') : '<p style="color: #9ca3af; font-size: 0.875rem; font-style: italic;">No active orders.</p>';
            document.getElementById('admin-orders-ready').innerHTML = ready.length ? ready.map(o => card(o, getReadyStatus(o))).join('') : '<p style="color: #9ca3af; font-size: 0.875rem; font-style: italic;">No ready orders.</p>';
    },

    setStatus(id, st) {
        const o = this.data.orders.find(x=>x.id===id);
        if(o) { 
            o.status = st; 
            this.updateAdminOrders(); 
            if(st==='Cooking') this.showToast('Order Approved & Cooking');
            if(st==='Ready') this.showToast('Order Ready for Pickup'); 
        }
    },

    renderAdminMenu() {
        document.getElementById('admin-menu-list').innerHTML = this.data.menu.map(i => `
            <tr>
                <td>${i.name}</td>
                <td><span style="font-size: 0.75rem; padding: 2px 6px; background: #f3f4f6; border-radius: 4px; text-transform: capitalize;">${i.group || '-'}</span></td>
                <td><span style="font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: bold; ${i.type === 'veg' ? 'background: #dcfce7; color: #15803d;' : 'background: #fee2e2; color: #b91c1c;'}">${i.type}</span></td>
                <td>$${i.price}</td>
                <td style="text-align: right;"><button onclick="app.delItem(${i.id})" style="color: var(--danger); background: none; border: none; cursor: pointer;"><i class="fa-solid fa-trash"></i></button></td>
            </tr>
        `).join('');
    },

    addMenuItem(e) {
        e.preventDefault(); const f = e.target;
        this.data.menu.push({
            id: Date.now(), 
            name: f.name.value, 
            price: parseFloat(f.price.value), 
            cat: f.category.value, 
            type: f.type.value, 
            group: f.group.value,
            img: f.image.value
        });
        this.renderAdminMenu(); f.reset();
        this.showToast('Item Added');
    },
    
    delItem(id) { this.data.menu = this.data.menu.filter(i=>i.id!==id); this.renderAdminMenu(); },

    renderTables() {
        document.getElementById('admin-tables-grid').innerHTML = this.data.tables.map(t => {
            const color = t.status === 'free' ? 'background: #dcfce7; color: #15803d;' : (t.status==='reserved'?'background: #fef9c3; color: #a16207;':'background: #fee2e2; color: #b91c1c;');
            return `<div onclick="app.toggleTable(${t.id})" style="${color} padding: 1rem; border-radius: 8px; text-align: center; cursor: pointer; font-weight: bold;">T-${t.id}<br><span style="font-size: 0.75rem; font-weight: normal; text-transform: uppercase;">${t.status}</span></div>`;
        }).join('');
    },
    toggleTable(id) { const t=this.data.tables.find(x=>x.id===id); t.status = t.status==='free'?'reserved':(t.status==='reserved'?'occupied':'free'); this.renderTables(); },

    renderFleet() {
        const me = this.data.fleet.find(f=>f.isMe);
        if(me) me.status = this.data.riderStatus;
        document.getElementById('fleet-list').innerHTML = this.data.fleet.map(r => `
            <tr>
                <td style="font-weight: 500;">${r.name}</td>
                <td><span style="padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; ${r.status==='Online'?'background: #dcfce7; color: #15803d;':(r.status==='Busy'?'background: #fef9c3; color: #a16207;':'background: #e5e7eb; color: #4b5563;')}">${r.status}</span></td>
                <td style="font-size: 0.75rem; color: #6b7280;">${r.isMe ? 'You' : 'Idle'}</td>
            </tr>
        `).join('');
    },

    // --- RIDER ---
    setRiderStatus(status) {
        this.data.riderStatus = status;
        this.renderRider(); 
        this.showToast(`Status updated to ${status}`);
    },

    switchRiderTab(tab) {
        document.querySelectorAll('.rider-subpanel').forEach(el => el.classList.add('hide'));
        document.getElementById(`rider-panel-${tab}`).classList.remove('hide');
        
        document.querySelectorAll('.rider-tab').forEach(el => el.classList.remove('active'));
        document.getElementById(`rtab-${tab}`).classList.add('active');
    },

    renderRider() {
        if(this.data.riderStatus === 'Offline') {
            document.getElementById('rider-list-new').innerHTML = '<div style="padding: 2rem; text-align: center; color: #9ca3af;">You are Offline.<br>Go Online to receive orders.</div>';
            document.getElementById('rider-empty-new').classList.add('hide');
            return;
        }

        const newReqs = this.data.orders.filter(o => o.status === 'Ready' && o.riderStatus === 'Searching');
        const myActive = this.data.orders.filter(o => o.riderStatus === 'Accepted' || o.riderStatus === 'In Transit');

        const elNew = document.getElementById('rider-list-new');
        if(newReqs.length === 0) {
            elNew.innerHTML = ''; document.getElementById('rider-empty-new').classList.remove('hide');
        } else {
            document.getElementById('rider-empty-new').classList.add('hide');
            elNew.innerHTML = newReqs.map(o => `
                <div class="rider-card">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold;">Order #${o.id}</span>
                        <span style="font-size: 0.75rem; background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold;">$${o.total.toFixed(2)}</span>
                    </div>
                    <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.5rem;"><i class="fa-solid fa-location-dot"></i> ${o.address}</p>
                    <div class="btn-group">
                        <button onclick="app.riderReject(${o.id})" class="btn-outline-danger">Reject</button>
                        <button onclick="app.riderAccept(${o.id})" class="btn-solid-dark">Accept</button>
                    </div>
                </div>
            `).join('');
        }

        const elAct = document.getElementById('rider-list-active');
        if(myActive.length === 0) {
            elAct.innerHTML = ''; document.getElementById('rider-empty-active').classList.remove('hide');
        } else {
            document.getElementById('rider-empty-active').classList.add('hide');
            elAct.innerHTML = myActive.map(o => `
                <div class="rider-card" style="border-left: 4px solid var(--blue); box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <span style="font-weight: bold; font-size: 1.1rem;">#${o.id}</span>
                        <a href="#" style="color: var(--blue); font-size: 0.75rem; text-decoration: underline;"><i class="fa-solid fa-map"></i> Open Map</a>
                    </div>
                    <div style="background: white; padding: 0.5rem; border-radius: 4px; font-size: 0.875rem; border: 1px solid var(--border); margin-bottom: 0.75rem;">
                        <p style="font-weight: bold; margin-bottom: 2px;">Delivery Address:</p>
                        <p>${o.address}</p>
                    </div>
                    <div class="btn-group">
                        <button onclick="app.riderFail(${o.id})" class="btn-outline-danger" style="flex:1;">Failed</button>
                        <button onclick="app.riderComplete(${o.id})" class="btn-solid-dark" style="background: var(--success); flex:1;">Delivered</button>
                    </div>
                </div>
            `).join('');
        }
    },

    riderAccept(id) {
        const o = this.data.orders.find(x=>x.id===id);
        if(o) {
            o.riderStatus = 'Accepted';
            this.setRiderStatus('On Duty');
            document.getElementById('rider-status-select').value = 'On Duty';
            this.switchRiderTab('active');
            this.renderRider();
            this.showToast('Order Accepted');
        }
    },

    riderReject(id) { this.showToast('Order Rejected', 'error'); },

    riderComplete(id) {
        if(!confirm('Mark order as delivered?')) return;
        const o = this.data.orders.find(x=>x.id===id);
        o.status = 'Delivered'; o.riderStatus = 'Delivered';
        this.setRiderStatus('Online'); document.getElementById('rider-status-select').value = 'Online';
        this.renderRider(); this.showToast('Delivery Completed!');
    },
    
    riderFail(id) {
        if(!confirm('Mark delivery as failed?')) return;
        const o = this.data.orders.find(x=>x.id===id);
        o.riderStatus = 'Failed';
        this.setRiderStatus('Online'); document.getElementById('rider-status-select').value = 'Online';
        this.renderRider(); this.showToast('Delivery Marked Failed', 'error');
    },

    showToast(msg, type='success') {
        const t = document.getElementById('toast');
        document.getElementById('toast-msg').innerText = msg;
        const icon = t.querySelector('i');
        if(type==='error'){ 
            icon.className="fa-solid fa-circle-xmark"; 
            t.style.background = "var(--danger)";
        } else { 
            icon.className="fa-solid fa-check-circle"; 
            t.style.background = "var(--secondary)";
        }
        t.classList.add('show');
        setTimeout(()=>t.classList.remove('show'), 3000);
    }
};

document.addEventListener('DOMContentLoaded', ()=>app.init());