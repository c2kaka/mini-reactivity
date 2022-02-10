let activeEffect = null;

const targetMap = new WeakMap();

function reactive(target) {
    const handler = {
        get(target, key, receiver) {
            const result = Reflect.get(target, key, receiver);
            track(target, key);
            return result;
        },
        set(target, key, value, receiver) {
            const oldValue = target[key];
            const result = Reflect.set(target, key, value, receiver);
            if (oldValue !== value) {
                trigger(target, key);
            }
            return result;
        }
    };

    return new Proxy(target, handler);
}

function track(target, key) {
    if (activeEffect) { // only track when effect is active
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }

        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Set();
            depsMap.set(key, dep);
        }

        dep.add(activeEffect);
    }
}

function trigger(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        return;
    }

    let dep = depsMap.get(key);
    if (dep) {
        dep.forEach(effect => effect());
    }
}

function effect(eff) {
    activeEffect = eff;
    activeEffect();
    activeEffect = null;
}

// ----- test -----
let product = reactive({ price: 5, quantity: 2 })
let salePrice = 0
let total = 0

effect(() => {
    total = product.price * product.quantity
})
effect(() => {
    salePrice = product.price * 0.9
})

console.log(
    `Before updated quantity total (should be 10) = ${total} salePrice (should be 4.5) = ${salePrice}`
)
product.quantity = 3
console.log(
    `After updated quantity total (should be 15) = ${total} salePrice (should be 4.5) = ${salePrice}`
)
product.price = 10
console.log(
    `After updated price total (should be 30) = ${total} salePrice (should be 9) = ${salePrice}`
)



