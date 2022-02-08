/**
 * main concepts:
 * targetMap: WeakMap
 * depsMap: Map
 * deps: Set
 * track() effect() trigger()
 */
const targetMap = new WeakMap();

function track(target, key, effect) {
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

    dep.add(effect);
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


let product = { quantity: 0, price: 5, total: 0 };
let effect = () => {
    product.total = product.quantity * product.price;
};

track(product, 'quantity', effect);
track(product, 'price', effect);
product.quantity = 20;
trigger(product, 'quantity');
console.log(product.total); // 100
