// Pointers v13 Multiplayer for Forge
Hooks.once('init', () => {
    console.log("Pointers v13 Multiplayer module initialized.");

    const POINTER_KEY = "x";
    const BUBBLE_KEY = "Control+X";

    // Store active pointers per user
    window.pointers = {};

    // Helper to create pointer element
    function createPointer(userId, type) {
        let el = document.createElement("div");
        el.className = "fvtt-pointer";
        el.dataset.user = userId;
        el.dataset.type = type;
        el.style.position = "absolute";
        el.style.width = "32px";
        el.style.height = "32px";
        el.style.background = type === 'bubble' ? 'red' : 'blue';
        el.style.borderRadius = "50%";
        el.style.pointerEvents = "none";
        document.body.appendChild(el);
        return el;
    }

    // Handle pointer data received from socket
    game.socket.on('module.pointers-v13', data => {
        if (!data.userId || data.userId === game.user.id) return;
        let pointerEl = window.pointers[data.userId];
        if (!pointerEl) pointerEl = createPointer(data.userId, data.type);
        pointerEl.style.left = data.x + "px";
        pointerEl.style.top = data.y + "px";
        pointerEl.dataset.type = data.type;
        window.pointers[data.userId] = pointerEl;
    });

    // Send pointer data to all clients
    function broadcastPointer(x, y, type) {
        game.socket.emit('module.pointers-v13', {
            userId: game.user.id,
            x, y,
            type
        });
    }

    // Track mouse movement
    window.addEventListener('mousemove', e => {
        let type = window.currentPointerType;
        if (!type) return;
        broadcastPointer(e.clientX, e.clientY, type);
        // Move own pointer locally
        let el = window.pointers[game.user.id];
        if (!el) el = createPointer(game.user.id, type);
        el.style.left = e.clientX + "px";
        el.style.top = e.clientY + "px";
        el.dataset.type = type;
        window.pointers[game.user.id] = el;
    });

    // Track keydown for pointer types
    window.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === "x" && !e.ctrlKey) {
            window.currentPointerType = "pointer";
        } else if (e.key.toLowerCase() === "x" && e.ctrlKey) {
            window.currentPointerType = "bubble";
        }
    });

    window.addEventListener('keyup', e => {
        if (e.key.toLowerCase() === "x") {
            window.currentPointerType = null;
        }
    });
});