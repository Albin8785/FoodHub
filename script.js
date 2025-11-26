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
        document.querySelectorAll('.login-role-btn').forEach(btn => {
            if (btn.dataset.role === role) {
                btn.classList.add('login-active'); btn.classList.remove('text-gray-500');
            } else {
                btn.classList.remove('login-active'); btn.classList.add('text-gray-500');
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

    // --- NEW: QR LOGIN ---
    loginQR() {
        this.data.currentRole = 'takeaway';
        this.updateNav(true, 'Guest (Takeaway)', 'takeaway');
        this.navigate('customer'); // Reuses customer view, but acts as takeaway
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
        
        const btnOrder = document.getElementById('btn-cust-order');
        const btnBook = document.getElementById('btn-cust-book');
        
        if(subview === 'order') {
            btnOrder.className = "text-lg font-bold border-b-2 border-gray-900 pb-1";
            btnBook.className = "text-lg font-bold text-gray-400 border-b-2 border-transparent pb-1 hover:text-gray-600";
        } else {
            btnBook.className = "text-lg font-bold border-b-2 border-gray-900 pb-1";
            btnOrder.className = "text-lg font-bold text-gray-400 border-b-2 border-transparent pb-1 hover:text-gray-600";
            this.renderCustomerTables();
        }
    },

    setMenuFilter(type) {
        this.data.menuFilter = type;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if(btn.dataset.filter === type) btn.classList.add('active-filter');
            else btn.classList.remove('active-filter');
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
                ? '<span class="absolute top-2 left-2 bg-white/90 p-1 rounded shadow"><div class="w-3 h-3 border border-green-600 flex items-center justify-center"><div class="w-2 h-2 bg-green-600 rounded-full"></div></div></span>'
                : '<span class="absolute top-2 left-2 bg-white/90 p-1 rounded shadow"><div class="w-3 h-3 border border-red-600 flex items-center justify-center"><div class="w-2 h-2 bg-red-600 rotate-45"></div></div></span>';

            return `
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition relative">
                <div class="h-40 overflow-hidden rounded-lg mb-3 relative">
                    <img src="${item.img}" class="w-full h-full object-cover">
                    ${indicator}
                    <span class="absolute bottom-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold shadow">$${item.price.toFixed(2)}</span>
                </div>
                <h4 class="font-bold text-gray-800">${item.name}</h4>
                <p class="text-xs text-gray-400 capitalize">${item.type} • ${item.cat}</p>
                <button onclick="app.addToCart(${item.id})" class="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg text-sm font-medium transition">Add +</button>
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
            container.innerHTML = '<div class="col-span-3 text-center text-gray-400 py-10 w-full">No items found for this preference.</div>';
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
        if(!this.data.cart.length) { container.innerHTML = 'Your cart is empty'; document.getElementById('cart-total').innerText = '$0.00'; document.getElementById('cart-count').innerText = '0'; return; }
        let total = 0;
        container.innerHTML = this.data.cart.map(c => {
            total += c.price * c.qty;
            const typeColor = c.type === 'veg' ? 'text-green-600' : 'text-red-600';
            return `<div class="flex justify-between items-center w-full bg-gray-50 p-2 rounded">
                    <div>
                        <p class="font-bold text-gray-800 flex items-center gap-1">
                            <i class="fa-solid fa-circle text-[8px] ${typeColor}"></i> ${c.name}
                        </p>
                        <p class="text-xs text-gray-500">$${c.price} x ${c.qty}</p>
                    </div>
                    <div class="flex gap-2"><button onclick="app.modQty(${c.id}, -1)" class="w-6 h-6 bg-white border rounded text-xs">-</button><button onclick="app.modQty(${c.id}, 1)" class="w-6 h-6 bg-white border rounded text-xs">+</button></div>
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
            let color = 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer border-green-200';
            let icon = 'fa-check';
            let action = `onclick="app.bookTable(${t.id})"`;
            
            if(t.status === 'reserved') { color = 'bg-yellow-100 text-yellow-700 cursor-not-allowed border-yellow-200 opacity-70'; icon = 'fa-clock'; action = ''; }
            if(t.status === 'occupied') { color = 'bg-red-100 text-red-700 cursor-not-allowed border-red-200 opacity-70'; icon = 'fa-user'; action = ''; }

            return `
                <div ${action} class="${color} border-2 rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition h-24">
                    <span class="text-lg font-bold">T-${t.id}</span>
                    <div class="flex items-center gap-1 text-xs font-bold uppercase"><i class="fa-solid ${icon}"></i> ${t.status}</div>
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

        // --- TOGGLE ADDRESS FIELD ---
        const addrContainer = document.getElementById('address-container');
        if(this.data.currentRole === 'takeaway') {
            addrContainer.classList.add('hide');
        } else {
            addrContainer.classList.remove('hide');
        }

        document.getElementById('modal-checkout').classList.remove('hide');
    },

    selectPayment(type) {
        this.data.selectedPayment = type;
        if(type === 'qr') document.getElementById('qr-display').classList.remove('hide');
        else document.getElementById('qr-display').classList.add('hide');
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
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.dataset.tab === tab ? btn.classList.add('tab-active') : btn.classList.remove('tab-active'));
        if(tab==='orders') this.updateAdminOrders();
    },
    
    updateAdminOrders() {
            const active = this.data.orders.filter(o=>o.status==='Pending' || o.status==='Cooking');
            const ready = this.data.orders.filter(o=>o.status==='Ready' || o.status==='Delivered'); 
            
            const card = (o, act) => `
            <div class="bg-gray-50 p-3 rounded border text-sm mb-2">
                <div class="flex justify-between font-bold">
                    <span>#${o.id}</span>
                    <span>$${o.total.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center mb-1">
                    <span class="text-xs text-gray-500 truncate">${o.items.length} items</span>
                    <span class="text-xs px-2 py-0.5 rounded font-bold ${o.type==='takeaway' ? 'bg-purple-100 text-purple-700' : (o.status==='Pending'?'bg-orange-100 text-orange-700':'bg-blue-100 text-blue-700')}">
                        ${o.type === 'takeaway' ? 'Takeaway' : o.status}
                    </span>
                </div>
                <details class="mb-3 text-xs">
                    <summary class="cursor-pointer text-blue-600 font-bold hover:underline flex items-center gap-1"><i class="fa-solid fa-circle-info"></i> View Details</summary>
                    <div class="mt-2 p-2 bg-white border rounded">
                        <p class="font-bold text-gray-700">Type: ${o.type ? o.type.toUpperCase() : 'DELIVERY'}</p>
                        <p class="font-bold text-gray-700">Address:</p>
                        <p class="text-gray-600 mb-2">${o.address}</p>
                        <p class="font-bold text-gray-700">Items:</p>
                        <ul class="list-disc pl-4 text-gray-600">${o.items.map(i=>`<li>${i.qty}x ${i.name} (${i.type})</li>`).join('')}</ul>
                    </div>
                </details>
                ${act}
            </div>`;

            const getActionBtn = (o) => {
            if(o.status === 'Pending') {
                return `<button onclick="app.setStatus(${o.id}, 'Cooking')" class="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1.5 rounded text-xs w-full font-bold shadow-sm">Approve & Cook</button>`;
            } else {
                return `<button onclick="app.setStatus(${o.id}, 'Ready')" class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs w-full font-bold shadow-sm">Mark Ready</button>`;
            }
            };
            
            // Status Logic for "Ready" Column
            const getReadyStatus = (o) => {
                if (o.type === 'takeaway') {
                    // For Takeaway, "Ready" means Completed/Pick up now
                    return `<span class="text-purple-600 text-xs font-bold block text-center border border-purple-200 bg-purple-50 rounded py-1">✅ Order Completed</span>`;
                } else {
                    // For Delivery, it waits for a rider
                    return `<span class="text-green-600 text-xs font-bold block text-center border border-green-200 bg-green-50 rounded py-1">Waiting Rider (${o.riderStatus})</span>`;
                }
            };
            
            document.getElementById('admin-orders-pending').innerHTML = active.length ? active.map(o => card(o, getActionBtn(o))).join('') : '<p class="text-gray-400 text-sm italic">No active orders.</p>';
            document.getElementById('admin-orders-ready').innerHTML = ready.length ? ready.map(o => card(o, getReadyStatus(o))).join('') : '<p class="text-gray-400 text-sm italic">No ready orders.</p>';
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
            <tr class="border-b last:border-0">
                <td class="py-2">${i.name}</td>
                <td class="py-2"><span class="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 capitalize">${i.group || '-'}</span></td>
                <td class="py-2"><span class="text-xs px-2 py-1 rounded font-bold ${i.type === 'veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${i.type}</span></td>
                <td class="py-2">$${i.price}</td>
                <td class="text-right"><button onclick="app.delItem(${i.id})" class="text-red-500"><i class="fa-solid fa-trash"></i></button></td>
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
            group: f.group.value, // Capture the group
            img: f.image.value
        });
        this.renderAdminMenu(); f.reset();
        this.showToast('Item Added');
    },
    
    delItem(id) { this.data.menu = this.data.menu.filter(i=>i.id!==id); this.renderAdminMenu(); },

    renderTables() {
        document.getElementById('admin-tables-grid').innerHTML = this.data.tables.map(t => {
            const color = t.status === 'free' ? 'bg-green-100 text-green-700' : (t.status==='reserved'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700');
            return `<div onclick="app.toggleTable(${t.id})" class="${color} p-4 rounded-lg text-center cursor-pointer font-bold">T-${t.id}<br><span class="text-xs font-normal uppercase">${t.status}</span></div>`;
        }).join('');
    },
    toggleTable(id) { const t=this.data.tables.find(x=>x.id===id); t.status = t.status==='free'?'reserved':(t.status==='reserved'?'occupied':'free'); this.renderTables(); },

    renderFleet() {
        const me = this.data.fleet.find(f=>f.isMe);
        if(me) me.status = this.data.riderStatus;
        document.getElementById('fleet-list').innerHTML = this.data.fleet.map(r => `
            <tr><td class="p-3 font-medium">${r.name}</td><td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${r.status==='Online'?'bg-green-100 text-green-700':(r.status==='Busy'?'bg-yellow-100 text-yellow-700':'bg-gray-200 text-gray-600')}">${r.status}</span></td><td class="p-3 text-xs text-gray-500">${r.isMe ? 'You' : 'Idle'}</td></tr>
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
        
        const tNew = document.getElementById('rtab-new');
        const tAct = document.getElementById('rtab-active');
        
        if(tab === 'new') {
            tNew.className = "flex-1 py-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600 bg-blue-50";
            tAct.className = "flex-1 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:bg-gray-100";
        } else {
            tAct.className = "flex-1 py-3 text-sm font-bold text-blue-600 border-b-2 border-blue-600 bg-blue-50";
            tNew.className = "flex-1 py-3 text-sm font-bold text-gray-500 border-b-2 border-transparent hover:bg-gray-100";
        }
    },

    renderRider() {
        if(this.data.riderStatus === 'Offline') {
            document.getElementById('rider-list-new').innerHTML = '<div class="p-8 text-center text-gray-400">You are Offline.<br>Go Online to receive orders.</div>';
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
                <div class="p-4 bg-white hover:bg-gray-50">
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-bold text-gray-800">Order #${o.id}</span>
                        <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-bold">$${o.total.toFixed(2)}</span>
                    </div>
                    <p class="text-xs text-gray-500 mb-2"><i class="fa-solid fa-location-dot mr-1"></i> ${o.address}</p>
                    <div class="flex gap-2 mt-3">
                        <button onclick="app.riderReject(${o.id})" class="flex-1 border border-red-200 text-red-600 py-2 rounded text-sm font-medium hover:bg-red-50">Reject</button>
                        <button onclick="app.riderAccept(${o.id})" class="flex-1 bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-gray-800">Accept</button>
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
                <div class="p-4 bg-white border-l-4 border-blue-500 shadow-sm mb-2">
                    <div class="flex justify-between items-start mb-2">
                        <span class="font-bold text-lg">#${o.id}</span>
                        <a href="#" class="text-blue-600 text-xs underline"><i class="fa-solid fa-map"></i> Open Map</a>
                    </div>
                    <div class="bg-gray-50 p-2 rounded text-sm text-gray-700 mb-3 border border-gray-100">
                        <p class="font-bold mb-1">Delivery Address:</p>
                        <p>${o.address}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <button onclick="app.riderFail(${o.id})" class="text-red-600 border border-red-200 py-2 rounded text-sm font-medium hover:bg-red-50">Failed</button>
                        <button onclick="app.riderComplete(${o.id})" class="bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700">Delivered</button>
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
        if(type==='error'){ icon.className="fa-solid fa-circle-xmark text-red-400"; }
        else { icon.className="fa-solid fa-check-circle text-green-400"; }
        t.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(()=>t.classList.add('translate-y-20', 'opacity-0'), 3000);
    }
};

document.addEventListener('DOMContentLoaded', ()=>app.init());