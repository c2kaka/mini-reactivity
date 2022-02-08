let total = 0;
const targetMap = new WeakMap();

function reactive(target) {
	const handler = {
		get(target, key, receiver) {
			const result = Reflect.get(target, key, receiver);
			track(target, key, effect);
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

const product = reactive({ quantity: 2, price: 10 });
let effect = () => { total = product.price * product.quantity; };
effect();
console.log(total); // 20
product.quantity = 4;
console.log(total); // 40

