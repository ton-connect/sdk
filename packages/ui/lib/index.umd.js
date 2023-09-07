var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("@tonconnect/sdk"), require("deepmerge"), require("ua-parser-js"), require("classnames")) : typeof define === "function" && define.amd ? define(["exports", "@tonconnect/sdk", "deepmerge", "ua-parser-js", "classnames"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.TON_CONNECT_UI = {}, global.TonConnectSDK, global.deepmerge, global.UAParser, global.classNames));
})(this, function(exports2, sdk, deepmerge, UAParser, cn) {
  var _a;
  "use strict";
  const _interopDefaultLegacy = (e2) => e2 && typeof e2 === "object" && "default" in e2 ? e2 : { default: e2 };
  const deepmerge__default = /* @__PURE__ */ _interopDefaultLegacy(deepmerge);
  const UAParser__default = /* @__PURE__ */ _interopDefaultLegacy(UAParser);
  const cn__default = /* @__PURE__ */ _interopDefaultLegacy(cn);
  const sharedConfig = {};
  function setHydrateContext(context) {
    sharedConfig.context = context;
  }
  const equalFn = (a2, b) => a2 === b;
  const $PROXY = Symbol("solid-proxy");
  const $TRACK = Symbol("solid-track");
  const signalOptions = {
    equals: equalFn
  };
  let runEffects = runQueue;
  const STALE = 1;
  const PENDING = 2;
  const UNOWNED = {
    owned: null,
    cleanups: null,
    context: null,
    owner: null
  };
  const NO_INIT = {};
  var Owner = null;
  let Transition$1 = null;
  let Listener = null;
  let Updates = null;
  let Effects = null;
  let ExecCount = 0;
  function createRoot(fn, detachedOwner) {
    const listener = Listener, owner = Owner, unowned = fn.length === 0, root = unowned ? UNOWNED : {
      owned: null,
      cleanups: null,
      context: null,
      owner: detachedOwner === void 0 ? owner : detachedOwner
    }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
    Owner = root;
    Listener = null;
    try {
      return runUpdates(updateFn, true);
    } finally {
      Listener = listener;
      Owner = owner;
    }
  }
  function createSignal(value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const s2 = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0
    };
    const setter = (value2) => {
      if (typeof value2 === "function") {
        value2 = value2(s2.value);
      }
      return writeSignal(s2, value2);
    };
    return [readSignal.bind(s2), setter];
  }
  function createComputed(fn, value, options) {
    const c2 = createComputation(fn, value, true, STALE);
    updateComputation(c2);
  }
  function createRenderEffect(fn, value, options) {
    const c2 = createComputation(fn, value, false, STALE);
    updateComputation(c2);
  }
  function createEffect(fn, value, options) {
    runEffects = runUserEffects;
    const c2 = createComputation(fn, value, false, STALE);
    c2.user = true;
    Effects ? Effects.push(c2) : updateComputation(c2);
  }
  function createMemo(fn, value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const c2 = createComputation(fn, value, true, 0);
    c2.observers = null;
    c2.observerSlots = null;
    c2.comparator = options.equals || void 0;
    updateComputation(c2);
    return readSignal.bind(c2);
  }
  function createResource(pSource, pFetcher, pOptions) {
    let source;
    let fetcher;
    let options;
    if (arguments.length === 2 && typeof pFetcher === "object" || arguments.length === 1) {
      source = true;
      fetcher = pSource;
      options = pFetcher || {};
    } else {
      source = pSource;
      fetcher = pFetcher;
      options = pOptions || {};
    }
    let pr = null, initP = NO_INIT, id = null, scheduled = false, resolved = "initialValue" in options, dynamic = typeof source === "function" && createMemo(source);
    const contexts = /* @__PURE__ */ new Set(), [value, setValue] = (options.storage || createSignal)(options.initialValue), [error, setError] = createSignal(void 0), [track, trigger] = createSignal(void 0, {
      equals: false
    }), [state, setState] = createSignal(resolved ? "ready" : "unresolved");
    if (sharedConfig.context) {
      id = `${sharedConfig.context.id}${sharedConfig.context.count++}`;
      let v;
      if (options.ssrLoadFrom === "initial")
        initP = options.initialValue;
      else if (sharedConfig.load && (v = sharedConfig.load(id)))
        initP = v[0];
    }
    function loadEnd(p2, v, error2, key) {
      if (pr === p2) {
        pr = null;
        resolved = true;
        if ((p2 === initP || v === initP) && options.onHydrated)
          queueMicrotask(() => options.onHydrated(key, {
            value: v
          }));
        initP = NO_INIT;
        completeLoad(v, error2);
      }
      return v;
    }
    function completeLoad(v, err) {
      runUpdates(() => {
        if (err === void 0)
          setValue(() => v);
        setState(err !== void 0 ? "errored" : "ready");
        setError(err);
        for (const c2 of contexts.keys())
          c2.decrement();
        contexts.clear();
      }, false);
    }
    function read() {
      const c2 = SuspenseContext, v = value(), err = error();
      if (err !== void 0 && !pr)
        throw err;
      if (Listener && !Listener.user && c2) {
        createComputed(() => {
          track();
          if (pr) {
            if (c2.resolved)
              ;
            else if (!contexts.has(c2)) {
              c2.increment();
              contexts.add(c2);
            }
          }
        });
      }
      return v;
    }
    function load(refetching = true) {
      if (refetching !== false && scheduled)
        return;
      scheduled = false;
      const lookup2 = dynamic ? dynamic() : source;
      if (lookup2 == null || lookup2 === false) {
        loadEnd(pr, untrack(value));
        return;
      }
      const p2 = initP !== NO_INIT ? initP : untrack(() => fetcher(lookup2, {
        value: value(),
        refetching
      }));
      if (typeof p2 !== "object" || !(p2 && "then" in p2)) {
        loadEnd(pr, p2, void 0, lookup2);
        return p2;
      }
      pr = p2;
      scheduled = true;
      queueMicrotask(() => scheduled = false);
      runUpdates(() => {
        setState(resolved ? "refreshing" : "pending");
        trigger();
      }, false);
      return p2.then((v) => loadEnd(p2, v, void 0, lookup2), (e2) => loadEnd(p2, void 0, castError(e2), lookup2));
    }
    Object.defineProperties(read, {
      state: {
        get: () => state()
      },
      error: {
        get: () => error()
      },
      loading: {
        get() {
          const s2 = state();
          return s2 === "pending" || s2 === "refreshing";
        }
      },
      latest: {
        get() {
          if (!resolved)
            return read();
          const err = error();
          if (err && !pr)
            throw err;
          return value();
        }
      }
    });
    if (dynamic)
      createComputed(() => load(false));
    else
      load(false);
    return [read, {
      refetch: load,
      mutate: setValue
    }];
  }
  function batch(fn) {
    return runUpdates(fn, false);
  }
  function untrack(fn) {
    if (Listener === null)
      return fn();
    const listener = Listener;
    Listener = null;
    try {
      return fn();
    } finally {
      Listener = listener;
    }
  }
  function on(deps, fn, options) {
    const isArray = Array.isArray(deps);
    let prevInput;
    let defer = options && options.defer;
    return (prevValue) => {
      let input;
      if (isArray) {
        input = Array(deps.length);
        for (let i2 = 0; i2 < deps.length; i2++)
          input[i2] = deps[i2]();
      } else
        input = deps();
      if (defer) {
        defer = false;
        return void 0;
      }
      const result = untrack(() => fn(input, prevInput, prevValue));
      prevInput = input;
      return result;
    };
  }
  function onMount(fn) {
    createEffect(() => untrack(fn));
  }
  function onCleanup(fn) {
    if (Owner === null)
      ;
    else if (Owner.cleanups === null)
      Owner.cleanups = [fn];
    else
      Owner.cleanups.push(fn);
    return fn;
  }
  function getListener() {
    return Listener;
  }
  function getOwner() {
    return Owner;
  }
  function createContext(defaultValue, options) {
    const id = Symbol("context");
    return {
      id,
      Provider: createProvider(id),
      defaultValue
    };
  }
  function useContext(context) {
    let ctx;
    return (ctx = lookup(Owner, context.id)) !== void 0 ? ctx : context.defaultValue;
  }
  function children(fn) {
    const children2 = createMemo(fn);
    const memo = createMemo(() => resolveChildren(children2()));
    memo.toArray = () => {
      const c2 = memo();
      return Array.isArray(c2) ? c2 : c2 != null ? [c2] : [];
    };
    return memo;
  }
  let SuspenseContext;
  function readSignal() {
    const runningTransition = Transition$1;
    if (this.sources && (this.state || runningTransition)) {
      if (this.state === STALE || runningTransition)
        updateComputation(this);
      else {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(this), false);
        Updates = updates;
      }
    }
    if (Listener) {
      const sSlot = this.observers ? this.observers.length : 0;
      if (!Listener.sources) {
        Listener.sources = [this];
        Listener.sourceSlots = [sSlot];
      } else {
        Listener.sources.push(this);
        Listener.sourceSlots.push(sSlot);
      }
      if (!this.observers) {
        this.observers = [Listener];
        this.observerSlots = [Listener.sources.length - 1];
      } else {
        this.observers.push(Listener);
        this.observerSlots.push(Listener.sources.length - 1);
      }
    }
    return this.value;
  }
  function writeSignal(node, value, isComp) {
    let current = node.value;
    if (!node.comparator || !node.comparator(current, value)) {
      node.value = value;
      if (node.observers && node.observers.length) {
        runUpdates(() => {
          for (let i2 = 0; i2 < node.observers.length; i2 += 1) {
            const o2 = node.observers[i2];
            const TransitionRunning = Transition$1 && Transition$1.running;
            if (TransitionRunning && Transition$1.disposed.has(o2))
              ;
            if (TransitionRunning && !o2.tState || !TransitionRunning && !o2.state) {
              if (o2.pure)
                Updates.push(o2);
              else
                Effects.push(o2);
              if (o2.observers)
                markDownstream(o2);
            }
            if (TransitionRunning)
              ;
            else
              o2.state = STALE;
          }
          if (Updates.length > 1e6) {
            Updates = [];
            if (false)
              ;
            throw new Error();
          }
        }, false);
      }
    }
    return value;
  }
  function updateComputation(node) {
    if (!node.fn)
      return;
    cleanNode(node);
    const owner = Owner, listener = Listener, time = ExecCount;
    Listener = Owner = node;
    runComputation(node, node.value, time);
    Listener = listener;
    Owner = owner;
  }
  function runComputation(node, value, time) {
    let nextValue;
    try {
      nextValue = node.fn(value);
    } catch (err) {
      if (node.pure) {
        {
          node.state = STALE;
          node.owned && node.owned.forEach(cleanNode);
          node.owned = null;
        }
      }
      handleError(err);
    }
    if (!node.updatedAt || node.updatedAt <= time) {
      if (node.updatedAt != null && "observers" in node) {
        writeSignal(node, nextValue);
      } else
        node.value = nextValue;
      node.updatedAt = time;
    }
  }
  function createComputation(fn, init, pure, state = STALE, options) {
    const c2 = {
      fn,
      state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: null,
      pure
    };
    if (Owner === null)
      ;
    else if (Owner !== UNOWNED) {
      {
        if (!Owner.owned)
          Owner.owned = [c2];
        else
          Owner.owned.push(c2);
      }
    }
    return c2;
  }
  function runTop(node) {
    const runningTransition = Transition$1;
    if (node.state === 0 || runningTransition)
      return;
    if (node.state === PENDING || runningTransition)
      return lookUpstream(node);
    if (node.suspense && untrack(node.suspense.inFallback))
      return node.suspense.effects.push(node);
    const ancestors = [node];
    while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (node.state || runningTransition)
        ancestors.push(node);
    }
    for (let i2 = ancestors.length - 1; i2 >= 0; i2--) {
      node = ancestors[i2];
      if (node.state === STALE || runningTransition) {
        updateComputation(node);
      } else if (node.state === PENDING || runningTransition) {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(node, ancestors[0]), false);
        Updates = updates;
      }
    }
  }
  function runUpdates(fn, init) {
    if (Updates)
      return fn();
    let wait = false;
    if (!init)
      Updates = [];
    if (Effects)
      wait = true;
    else
      Effects = [];
    ExecCount++;
    try {
      const res = fn();
      completeUpdates(wait);
      return res;
    } catch (err) {
      if (!wait)
        Effects = null;
      Updates = null;
      handleError(err);
    }
  }
  function completeUpdates(wait) {
    if (Updates) {
      runQueue(Updates);
      Updates = null;
    }
    if (wait)
      return;
    const e2 = Effects;
    Effects = null;
    if (e2.length)
      runUpdates(() => runEffects(e2), false);
  }
  function runQueue(queue) {
    for (let i2 = 0; i2 < queue.length; i2++)
      runTop(queue[i2]);
  }
  function runUserEffects(queue) {
    let i2, userLength = 0;
    for (i2 = 0; i2 < queue.length; i2++) {
      const e2 = queue[i2];
      if (!e2.user)
        runTop(e2);
      else
        queue[userLength++] = e2;
    }
    if (sharedConfig.context)
      setHydrateContext();
    for (i2 = 0; i2 < userLength; i2++)
      runTop(queue[i2]);
  }
  function lookUpstream(node, ignore) {
    const runningTransition = Transition$1;
    node.state = 0;
    for (let i2 = 0; i2 < node.sources.length; i2 += 1) {
      const source = node.sources[i2];
      if (source.sources) {
        if (source.state === STALE || runningTransition) {
          if (source !== ignore)
            runTop(source);
        } else if (source.state === PENDING || runningTransition)
          lookUpstream(source, ignore);
      }
    }
  }
  function markDownstream(node) {
    const runningTransition = Transition$1;
    for (let i2 = 0; i2 < node.observers.length; i2 += 1) {
      const o2 = node.observers[i2];
      if (!o2.state || runningTransition) {
        o2.state = PENDING;
        if (o2.pure)
          Updates.push(o2);
        else
          Effects.push(o2);
        o2.observers && markDownstream(o2);
      }
    }
  }
  function cleanNode(node) {
    let i2;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
        if (obs && obs.length) {
          const n2 = obs.pop(), s2 = source.observerSlots.pop();
          if (index < obs.length) {
            n2.sourceSlots[s2] = index;
            obs[index] = n2;
            source.observerSlots[index] = s2;
          }
        }
      }
    }
    if (node.owned) {
      for (i2 = 0; i2 < node.owned.length; i2++)
        cleanNode(node.owned[i2]);
      node.owned = null;
    }
    if (node.cleanups) {
      for (i2 = 0; i2 < node.cleanups.length; i2++)
        node.cleanups[i2]();
      node.cleanups = null;
    }
    node.state = 0;
    node.context = null;
  }
  function castError(err) {
    if (err instanceof Error || typeof err === "string")
      return err;
    return new Error("Unknown error");
  }
  function handleError(err) {
    err = castError(err);
    throw err;
  }
  function lookup(owner, key) {
    return owner ? owner.context && owner.context[key] !== void 0 ? owner.context[key] : lookup(owner.owner, key) : void 0;
  }
  function resolveChildren(children2) {
    if (typeof children2 === "function" && !children2.length)
      return resolveChildren(children2());
    if (Array.isArray(children2)) {
      const results = [];
      for (let i2 = 0; i2 < children2.length; i2++) {
        const result = resolveChildren(children2[i2]);
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
      }
      return results;
    }
    return children2;
  }
  function createProvider(id, options) {
    return function provider(props) {
      let res;
      createRenderEffect(() => res = untrack(() => {
        Owner.context = {
          [id]: props.value
        };
        return children(() => props.children);
      }), void 0);
      return res;
    };
  }
  const FALLBACK = Symbol("fallback");
  function dispose(d) {
    for (let i2 = 0; i2 < d.length; i2++)
      d[i2]();
  }
  function mapArray(list, mapFn, options = {}) {
    let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
    onCleanup(() => dispose(disposers));
    return () => {
      let newItems = list() || [], i2, j;
      newItems[$TRACK];
      return untrack(() => {
        let newLen = newItems.length, newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
        if (newLen === 0) {
          if (len !== 0) {
            dispose(disposers);
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
            indexes && (indexes = []);
          }
          if (options.fallback) {
            items = [FALLBACK];
            mapped[0] = createRoot((disposer) => {
              disposers[0] = disposer;
              return options.fallback();
            });
            len = 1;
          }
        } else if (len === 0) {
          mapped = new Array(newLen);
          for (j = 0; j < newLen; j++) {
            items[j] = newItems[j];
            mapped[j] = createRoot(mapper);
          }
          len = newLen;
        } else {
          temp = new Array(newLen);
          tempdisposers = new Array(newLen);
          indexes && (tempIndexes = new Array(newLen));
          for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++)
            ;
          for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
            temp[newEnd] = mapped[end];
            tempdisposers[newEnd] = disposers[end];
            indexes && (tempIndexes[newEnd] = indexes[end]);
          }
          newIndices = /* @__PURE__ */ new Map();
          newIndicesNext = new Array(newEnd + 1);
          for (j = newEnd; j >= start; j--) {
            item = newItems[j];
            i2 = newIndices.get(item);
            newIndicesNext[j] = i2 === void 0 ? -1 : i2;
            newIndices.set(item, j);
          }
          for (i2 = start; i2 <= end; i2++) {
            item = items[i2];
            j = newIndices.get(item);
            if (j !== void 0 && j !== -1) {
              temp[j] = mapped[i2];
              tempdisposers[j] = disposers[i2];
              indexes && (tempIndexes[j] = indexes[i2]);
              j = newIndicesNext[j];
              newIndices.set(item, j);
            } else
              disposers[i2]();
          }
          for (j = start; j < newLen; j++) {
            if (j in temp) {
              mapped[j] = temp[j];
              disposers[j] = tempdisposers[j];
              if (indexes) {
                indexes[j] = tempIndexes[j];
                indexes[j](j);
              }
            } else
              mapped[j] = createRoot(mapper);
          }
          mapped = mapped.slice(0, len = newLen);
          items = newItems.slice(0);
        }
        return mapped;
      });
      function mapper(disposer) {
        disposers[j] = disposer;
        if (indexes) {
          const [s2, set] = createSignal(j);
          indexes[j] = set;
          return mapFn(newItems[j], s2);
        }
        return mapFn(newItems[j]);
      }
    };
  }
  function createComponent(Comp, props) {
    return untrack(() => Comp(props || {}));
  }
  function trueFn() {
    return true;
  }
  const propTraps = {
    get(_, property, receiver) {
      if (property === $PROXY)
        return receiver;
      return _.get(property);
    },
    has(_, property) {
      if (property === $PROXY)
        return true;
      return _.has(property);
    },
    set: trueFn,
    deleteProperty: trueFn,
    getOwnPropertyDescriptor(_, property) {
      return {
        configurable: true,
        enumerable: true,
        get() {
          return _.get(property);
        },
        set: trueFn,
        deleteProperty: trueFn
      };
    },
    ownKeys(_) {
      return _.keys();
    }
  };
  function resolveSource(s2) {
    return !(s2 = typeof s2 === "function" ? s2() : s2) ? {} : s2;
  }
  function mergeProps(...sources) {
    let proxy = false;
    for (let i2 = 0; i2 < sources.length; i2++) {
      const s2 = sources[i2];
      proxy = proxy || !!s2 && $PROXY in s2;
      sources[i2] = typeof s2 === "function" ? (proxy = true, createMemo(s2)) : s2;
    }
    if (proxy) {
      return new Proxy({
        get(property) {
          for (let i2 = sources.length - 1; i2 >= 0; i2--) {
            const v = resolveSource(sources[i2])[property];
            if (v !== void 0)
              return v;
          }
        },
        has(property) {
          for (let i2 = sources.length - 1; i2 >= 0; i2--) {
            if (property in resolveSource(sources[i2]))
              return true;
          }
          return false;
        },
        keys() {
          const keys = [];
          for (let i2 = 0; i2 < sources.length; i2++)
            keys.push(...Object.keys(resolveSource(sources[i2])));
          return [...new Set(keys)];
        }
      }, propTraps);
    }
    const target = {};
    for (let i2 = sources.length - 1; i2 >= 0; i2--) {
      if (sources[i2]) {
        const descriptors = Object.getOwnPropertyDescriptors(sources[i2]);
        for (const key in descriptors) {
          if (key in target)
            continue;
          Object.defineProperty(target, key, {
            enumerable: true,
            get() {
              for (let i3 = sources.length - 1; i3 >= 0; i3--) {
                const v = (sources[i3] || {})[key];
                if (v !== void 0)
                  return v;
              }
            }
          });
        }
      }
    }
    return target;
  }
  function splitProps(props, ...keys) {
    const blocked = new Set(keys.flat());
    if ($PROXY in props) {
      const res = keys.map((k) => {
        return new Proxy({
          get(property) {
            return k.includes(property) ? props[property] : void 0;
          },
          has(property) {
            return k.includes(property) && property in props;
          },
          keys() {
            return k.filter((property) => property in props);
          }
        }, propTraps);
      });
      res.push(new Proxy({
        get(property) {
          return blocked.has(property) ? void 0 : props[property];
        },
        has(property) {
          return blocked.has(property) ? false : property in props;
        },
        keys() {
          return Object.keys(props).filter((k) => !blocked.has(k));
        }
      }, propTraps));
      return res;
    }
    const descriptors = Object.getOwnPropertyDescriptors(props);
    keys.push(Object.keys(descriptors).filter((k) => !blocked.has(k)));
    return keys.map((k) => {
      const clone = {};
      for (let i2 = 0; i2 < k.length; i2++) {
        const key = k[i2];
        if (!(key in props))
          continue;
        Object.defineProperty(clone, key, descriptors[key] ? descriptors[key] : {
          get() {
            return props[key];
          },
          set() {
            return true;
          },
          enumerable: true
        });
      }
      return clone;
    });
  }
  function For(props) {
    const fallback = "fallback" in props && {
      fallback: () => props.fallback
    };
    return createMemo(mapArray(() => props.each, props.children, fallback || void 0));
  }
  function Show(props) {
    let strictEqual = false;
    const keyed = props.keyed;
    const condition = createMemo(() => props.when, void 0, {
      equals: (a2, b) => strictEqual ? a2 === b : !a2 === !b
    });
    return createMemo(() => {
      const c2 = condition();
      if (c2) {
        const child = props.children;
        const fn = typeof child === "function" && child.length > 0;
        strictEqual = keyed || fn;
        return fn ? untrack(() => child(c2)) : child;
      }
      return props.fallback;
    }, void 0, void 0);
  }
  function Switch(props) {
    let strictEqual = false;
    let keyed = false;
    const equals = (a2, b) => a2[0] === b[0] && (strictEqual ? a2[1] === b[1] : !a2[1] === !b[1]) && a2[2] === b[2];
    const conditions = children(() => props.children), evalConditions = createMemo(() => {
      let conds = conditions();
      if (!Array.isArray(conds))
        conds = [conds];
      for (let i2 = 0; i2 < conds.length; i2++) {
        const c2 = conds[i2].when;
        if (c2) {
          keyed = !!conds[i2].keyed;
          return [i2, c2, conds[i2]];
        }
      }
      return [-1];
    }, void 0, {
      equals
    });
    return createMemo(() => {
      const [index, when, cond] = evalConditions();
      if (index < 0)
        return props.fallback;
      const c2 = cond.children;
      const fn = typeof c2 === "function" && c2.length > 0;
      strictEqual = keyed || fn;
      return fn ? untrack(() => c2(when)) : c2;
    }, void 0, void 0);
  }
  function Match(props) {
    return props;
  }
  const booleans = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "controls", "default", "disabled", "formnovalidate", "hidden", "indeterminate", "ismap", "loop", "multiple", "muted", "nomodule", "novalidate", "open", "playsinline", "readonly", "required", "reversed", "seamless", "selected"];
  const Properties = /* @__PURE__ */ new Set(["className", "value", "readOnly", "formNoValidate", "isMap", "noModule", "playsInline", ...booleans]);
  const ChildProperties = /* @__PURE__ */ new Set(["innerHTML", "textContent", "innerText", "children"]);
  const Aliases = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
    className: "class",
    htmlFor: "for"
  });
  const PropAliases = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
    class: "className",
    formnovalidate: "formNoValidate",
    ismap: "isMap",
    nomodule: "noModule",
    playsinline: "playsInline",
    readonly: "readOnly"
  });
  const DelegatedEvents = /* @__PURE__ */ new Set(["beforeinput", "click", "dblclick", "contextmenu", "focusin", "focusout", "input", "keydown", "keyup", "mousedown", "mousemove", "mouseout", "mouseover", "mouseup", "pointerdown", "pointermove", "pointerout", "pointerover", "pointerup", "touchend", "touchmove", "touchstart"]);
  const SVGElements = /* @__PURE__ */ new Set([
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animate",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "color-profile",
    "cursor",
    "defs",
    "desc",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "font",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignObject",
    "g",
    "glyph",
    "glyphRef",
    "hkern",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "missing-glyph",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "set",
    "stop",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "tref",
    "tspan",
    "use",
    "view",
    "vkern"
  ]);
  const SVGNamespace = {
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace"
  };
  function reconcileArrays(parentNode, a2, b) {
    let bLength = b.length, aEnd = a2.length, bEnd = bLength, aStart = 0, bStart = 0, after = a2[aEnd - 1].nextSibling, map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a2[aStart] === b[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a2[aEnd - 1] === b[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node = bEnd < bLength ? bStart ? b[bStart - 1].nextSibling : b[bEnd - bStart] : after;
        while (bStart < bEnd)
          parentNode.insertBefore(b[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a2[aStart]))
            a2[aStart].remove();
          aStart++;
        }
      } else if (a2[aStart] === b[bEnd - 1] && b[bStart] === a2[aEnd - 1]) {
        const node = a2[--aEnd].nextSibling;
        parentNode.insertBefore(b[bStart++], a2[aStart++].nextSibling);
        parentNode.insertBefore(b[--bEnd], node);
        a2[aEnd] = b[bEnd];
      } else {
        if (!map) {
          map = /* @__PURE__ */ new Map();
          let i2 = bStart;
          while (i2 < bEnd)
            map.set(b[i2], i2++);
        }
        const index = map.get(a2[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i2 = aStart, sequence = 1, t2;
            while (++i2 < aEnd && i2 < bEnd) {
              if ((t2 = map.get(a2[i2])) == null || t2 !== index + sequence)
                break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a2[aStart];
              while (bStart < index)
                parentNode.insertBefore(b[bStart++], node);
            } else
              parentNode.replaceChild(b[bStart++], a2[aStart++]);
          } else
            aStart++;
        } else
          a2[aStart++].remove();
      }
    }
  }
  const $$EVENTS = "_$DX_DELEGATE";
  function render(code, element, init, options = {}) {
    let disposer;
    createRoot((dispose2) => {
      disposer = dispose2;
      element === document ? code() : insert(element, code(), element.firstChild ? null : void 0, init);
    }, options.owner);
    return () => {
      disposer();
      element.textContent = "";
    };
  }
  function template$1(html, check, isSVG) {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const t2 = document.createElement("template");
    t2.innerHTML = html;
    let node = t2.content.firstChild;
    if (isSVG)
      node = node.firstChild;
    return node;
  }
  function delegateEvents(eventNames, document2 = window.document) {
    const e2 = document2[$$EVENTS] || (document2[$$EVENTS] = /* @__PURE__ */ new Set());
    for (let i2 = 0, l2 = eventNames.length; i2 < l2; i2++) {
      const name = eventNames[i2];
      if (!e2.has(name)) {
        e2.add(name);
        document2.addEventListener(name, eventHandler);
      }
    }
  }
  function setAttribute(node, name, value) {
    if (value == null)
      node.removeAttribute(name);
    else
      node.setAttribute(name, value);
  }
  function setAttributeNS(node, namespace, name, value) {
    if (value == null)
      node.removeAttributeNS(namespace, name);
    else
      node.setAttributeNS(namespace, name, value);
  }
  function className(node, value) {
    if (value == null)
      node.removeAttribute("class");
    else
      node.className = value;
  }
  function addEventListener(node, name, handler, delegate) {
    if (delegate) {
      if (Array.isArray(handler)) {
        node[`$$${name}`] = handler[0];
        node[`$$${name}Data`] = handler[1];
      } else
        node[`$$${name}`] = handler;
    } else if (Array.isArray(handler)) {
      const handlerFn = handler[0];
      node.addEventListener(name, handler[0] = (e2) => handlerFn.call(node, handler[1], e2));
    } else
      node.addEventListener(name, handler);
  }
  function classList(node, value, prev = {}) {
    const classKeys = Object.keys(value || {}), prevKeys = Object.keys(prev);
    let i2, len;
    for (i2 = 0, len = prevKeys.length; i2 < len; i2++) {
      const key = prevKeys[i2];
      if (!key || key === "undefined" || value[key])
        continue;
      toggleClassKey(node, key, false);
      delete prev[key];
    }
    for (i2 = 0, len = classKeys.length; i2 < len; i2++) {
      const key = classKeys[i2], classValue = !!value[key];
      if (!key || key === "undefined" || prev[key] === classValue || !classValue)
        continue;
      toggleClassKey(node, key, true);
      prev[key] = classValue;
    }
    return prev;
  }
  function style(node, value, prev) {
    if (!value)
      return prev ? setAttribute(node, "style") : value;
    const nodeStyle = node.style;
    if (typeof value === "string")
      return nodeStyle.cssText = value;
    typeof prev === "string" && (nodeStyle.cssText = prev = void 0);
    prev || (prev = {});
    value || (value = {});
    let v, s2;
    for (s2 in prev) {
      value[s2] == null && nodeStyle.removeProperty(s2);
      delete prev[s2];
    }
    for (s2 in value) {
      v = value[s2];
      if (v !== prev[s2]) {
        nodeStyle.setProperty(s2, v);
        prev[s2] = v;
      }
    }
    return prev;
  }
  function spread(node, props = {}, isSVG, skipChildren) {
    const prevProps = {};
    if (!skipChildren) {
      createRenderEffect(() => prevProps.children = insertExpression(node, props.children, prevProps.children));
    }
    createRenderEffect(() => props.ref && props.ref(node));
    createRenderEffect(() => assign(node, props, isSVG, true, prevProps, true));
    return prevProps;
  }
  function use(fn, element, arg) {
    return untrack(() => fn(element, arg));
  }
  function insert(parent, accessor, marker, initial) {
    if (marker !== void 0 && !initial)
      initial = [];
    if (typeof accessor !== "function")
      return insertExpression(parent, accessor, initial, marker);
    createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
  }
  function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
    props || (props = {});
    for (const prop in prevProps) {
      if (!(prop in props)) {
        if (prop === "children")
          continue;
        prevProps[prop] = assignProp(node, prop, null, prevProps[prop], isSVG, skipRef);
      }
    }
    for (const prop in props) {
      if (prop === "children") {
        if (!skipChildren)
          insertExpression(node, props.children);
        continue;
      }
      const value = props[prop];
      prevProps[prop] = assignProp(node, prop, value, prevProps[prop], isSVG, skipRef);
    }
  }
  function getNextElement(template2) {
    let node, key;
    if (!sharedConfig.context || !(node = sharedConfig.registry.get(key = getHydrationKey()))) {
      return template2.cloneNode(true);
    }
    if (sharedConfig.completed)
      sharedConfig.completed.add(node);
    sharedConfig.registry.delete(key);
    return node;
  }
  function toPropertyName(name) {
    return name.toLowerCase().replace(/-([a-z])/g, (_, w) => w.toUpperCase());
  }
  function toggleClassKey(node, key, value) {
    const classNames = key.trim().split(/\s+/);
    for (let i2 = 0, nameLen = classNames.length; i2 < nameLen; i2++)
      node.classList.toggle(classNames[i2], value);
  }
  function assignProp(node, prop, value, prev, isSVG, skipRef) {
    let isCE, isProp, isChildProp;
    if (prop === "style")
      return style(node, value, prev);
    if (prop === "classList")
      return classList(node, value, prev);
    if (value === prev)
      return prev;
    if (prop === "ref") {
      if (!skipRef)
        value(node);
    } else if (prop.slice(0, 3) === "on:") {
      const e2 = prop.slice(3);
      prev && node.removeEventListener(e2, prev);
      value && node.addEventListener(e2, value);
    } else if (prop.slice(0, 10) === "oncapture:") {
      const e2 = prop.slice(10);
      prev && node.removeEventListener(e2, prev, true);
      value && node.addEventListener(e2, value, true);
    } else if (prop.slice(0, 2) === "on") {
      const name = prop.slice(2).toLowerCase();
      const delegate = DelegatedEvents.has(name);
      if (!delegate && prev) {
        const h2 = Array.isArray(prev) ? prev[0] : prev;
        node.removeEventListener(name, h2);
      }
      if (delegate || value) {
        addEventListener(node, name, value, delegate);
        delegate && delegateEvents([name]);
      }
    } else if ((isChildProp = ChildProperties.has(prop)) || !isSVG && (PropAliases[prop] || (isProp = Properties.has(prop))) || (isCE = node.nodeName.includes("-"))) {
      if (prop === "class" || prop === "className")
        className(node, value);
      else if (isCE && !isProp && !isChildProp)
        node[toPropertyName(prop)] = value;
      else
        node[PropAliases[prop] || prop] = value;
    } else {
      const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
      if (ns)
        setAttributeNS(node, ns, prop, value);
      else
        setAttribute(node, Aliases[prop] || prop, value);
    }
    return value;
  }
  function eventHandler(e2) {
    const key = `$$${e2.type}`;
    let node = e2.composedPath && e2.composedPath()[0] || e2.target;
    if (e2.target !== node) {
      Object.defineProperty(e2, "target", {
        configurable: true,
        value: node
      });
    }
    Object.defineProperty(e2, "currentTarget", {
      configurable: true,
      get() {
        return node || document;
      }
    });
    if (sharedConfig.registry && !sharedConfig.done) {
      sharedConfig.done = true;
      document.querySelectorAll("[id^=pl-]").forEach((elem) => {
        while (elem && elem.nodeType !== 8 && elem.nodeValue !== "pl-" + e2) {
          let x = elem.nextSibling;
          elem.remove();
          elem = x;
        }
        elem && elem.remove();
      });
    }
    while (node) {
      const handler = node[key];
      if (handler && !node.disabled) {
        const data = node[`${key}Data`];
        data !== void 0 ? handler.call(node, data, e2) : handler.call(node, e2);
        if (e2.cancelBubble)
          return;
      }
      node = node._$host || node.parentNode || node.host;
    }
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    if (sharedConfig.context && !current)
      current = [...parent.childNodes];
    while (typeof current === "function")
      current = current();
    if (value === current)
      return current;
    const t2 = typeof value, multi = marker !== void 0;
    parent = multi && current[0] && current[0].parentNode || parent;
    if (t2 === "string" || t2 === "number") {
      if (sharedConfig.context)
        return current;
      if (t2 === "number")
        value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && node.nodeType === 3) {
          node.data = value;
        } else
          node = document.createTextNode(value);
        current = cleanChildren(parent, current, marker, node);
      } else {
        if (current !== "" && typeof current === "string") {
          current = parent.firstChild.data = value;
        } else
          current = parent.textContent = value;
      }
    } else if (value == null || t2 === "boolean") {
      if (sharedConfig.context)
        return current;
      current = cleanChildren(parent, current, marker);
    } else if (t2 === "function") {
      createRenderEffect(() => {
        let v = value();
        while (typeof v === "function")
          v = v();
        current = insertExpression(parent, v, current, marker);
      });
      return () => current;
    } else if (Array.isArray(value)) {
      const array = [];
      const currentArray = current && Array.isArray(current);
      if (normalizeIncomingArray(array, value, current, unwrapArray)) {
        createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
        return () => current;
      }
      if (sharedConfig.context) {
        if (!array.length)
          return current;
        for (let i2 = 0; i2 < array.length; i2++) {
          if (array[i2].parentNode)
            return current = array;
        }
      }
      if (array.length === 0) {
        current = cleanChildren(parent, current, marker);
        if (multi)
          return current;
      } else if (currentArray) {
        if (current.length === 0) {
          appendNodes(parent, array, marker);
        } else
          reconcileArrays(parent, current, array);
      } else {
        current && cleanChildren(parent);
        appendNodes(parent, array);
      }
      current = array;
    } else if (value instanceof Node) {
      if (sharedConfig.context && value.parentNode)
        return current = multi ? [value] : value;
      if (Array.isArray(current)) {
        if (multi)
          return current = cleanChildren(parent, current, marker, value);
        cleanChildren(parent, current, null, value);
      } else if (current == null || current === "" || !parent.firstChild) {
        parent.appendChild(value);
      } else
        parent.replaceChild(value, parent.firstChild);
      current = value;
    } else
      ;
    return current;
  }
  function normalizeIncomingArray(normalized, array, current, unwrap2) {
    let dynamic = false;
    for (let i2 = 0, len = array.length; i2 < len; i2++) {
      let item = array[i2], prev = current && current[i2];
      if (item instanceof Node) {
        normalized.push(item);
      } else if (item == null || item === true || item === false)
        ;
      else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
      } else if (typeof item === "function") {
        if (unwrap2) {
          while (typeof item === "function")
            item = item();
          dynamic = normalizeIncomingArray(normalized, Array.isArray(item) ? item : [item], Array.isArray(prev) ? prev : [prev]) || dynamic;
        } else {
          normalized.push(item);
          dynamic = true;
        }
      } else {
        const value = String(item);
        if (prev && prev.nodeType === 3 && prev.data === value) {
          normalized.push(prev);
        } else
          normalized.push(document.createTextNode(value));
      }
    }
    return dynamic;
  }
  function appendNodes(parent, array, marker = null) {
    for (let i2 = 0, len = array.length; i2 < len; i2++)
      parent.insertBefore(array[i2], marker);
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === void 0)
      return parent.textContent = "";
    const node = replacement || document.createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i2 = current.length - 1; i2 >= 0; i2--) {
        const el = current[i2];
        if (node !== el) {
          const isParent = el.parentNode === parent;
          if (!inserted && !i2)
            isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
          else
            isParent && el.remove();
        } else
          inserted = true;
      }
    } else
      parent.insertBefore(node, marker);
    return [node];
  }
  function getHydrationKey() {
    const hydrate = sharedConfig.context;
    return `${hydrate.id}${hydrate.count++}`;
  }
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  function createElement(tagName, isSVG = false) {
    return isSVG ? document.createElementNS(SVG_NAMESPACE, tagName) : document.createElement(tagName);
  }
  function Portal(props) {
    const {
      useShadow
    } = props, marker = document.createTextNode(""), mount = props.mount || document.body;
    function renderPortal() {
      if (sharedConfig.context) {
        const [s2, set] = createSignal(false);
        queueMicrotask(() => set(true));
        return () => s2() && props.children;
      } else
        return () => props.children;
    }
    if (mount instanceof HTMLHeadElement) {
      const [clean, setClean] = createSignal(false);
      const cleanup = () => setClean(true);
      createRoot((dispose2) => insert(mount, () => !clean() ? renderPortal()() : dispose2(), null));
      onCleanup(() => {
        if (sharedConfig.context)
          queueMicrotask(cleanup);
        else
          cleanup();
      });
    } else {
      const container = createElement(props.isSVG ? "g" : "div", props.isSVG), renderRoot = useShadow && container.attachShadow ? container.attachShadow({
        mode: "open"
      }) : container;
      Object.defineProperty(container, "_$host", {
        get() {
          return marker.parentNode;
        },
        configurable: true
      });
      insert(renderRoot, renderPortal());
      mount.appendChild(container);
      props.ref && props.ref(container);
      onCleanup(() => mount.removeChild(container));
    }
    return marker;
  }
  function Dynamic(props) {
    const [p2, others] = splitProps(props, ["component"]);
    const cached = createMemo(() => p2.component);
    return createMemo(() => {
      const component = cached();
      switch (typeof component) {
        case "function":
          return untrack(() => component(others));
        case "string":
          const isSvg = SVGElements.has(component);
          const el = sharedConfig.context ? getNextElement() : createElement(component, isSvg);
          spread(el, others, isSvg);
          return el;
      }
    });
  }
  const [walletsModalOpen, setWalletsModalOpen] = createSignal(false);
  const [lastSelectedWalletInfo, setLastSelectedWalletInfo] = createSignal(null);
  const [action, setAction] = createSignal(null);
  let e = { data: "" }, t = (t2) => "object" == typeof window ? ((t2 ? t2.querySelector("#_goober") : window._goober) || Object.assign((t2 || document.head).appendChild(document.createElement("style")), { innerHTML: " ", id: "_goober" })).firstChild : t2 || e, l = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g, a = /\/\*[^]*?\*\/|  +/g, n = /\n+/g, o = (e2, t2) => {
    let r = "", l2 = "", a2 = "";
    for (let n2 in e2) {
      let c2 = e2[n2];
      "@" == n2[0] ? "i" == n2[1] ? r = n2 + " " + c2 + ";" : l2 += "f" == n2[1] ? o(c2, n2) : n2 + "{" + o(c2, "k" == n2[1] ? "" : t2) + "}" : "object" == typeof c2 ? l2 += o(c2, t2 ? t2.replace(/([^,])+/g, (e3) => n2.replace(/(^:.*)|([^,])+/g, (t3) => /&/.test(t3) ? t3.replace(/&/g, e3) : e3 ? e3 + " " + t3 : t3)) : n2) : null != c2 && (n2 = /^--/.test(n2) ? n2 : n2.replace(/[A-Z]/g, "-$&").toLowerCase(), a2 += o.p ? o.p(n2, c2) : n2 + ":" + c2 + ";");
    }
    return r + (t2 && a2 ? t2 + "{" + a2 + "}" : a2) + l2;
  }, c = {}, s = (e2) => {
    if ("object" == typeof e2) {
      let t2 = "";
      for (let r in e2)
        t2 += r + s(e2[r]);
      return t2;
    }
    return e2;
  }, i = (e2, t2, r, i2, p2) => {
    let u2 = s(e2), d = c[u2] || (c[u2] = ((e3) => {
      let t3 = 0, r2 = 11;
      for (; t3 < e3.length; )
        r2 = 101 * r2 + e3.charCodeAt(t3++) >>> 0;
      return "go" + r2;
    })(u2));
    if (!c[d]) {
      let t3 = u2 !== e2 ? e2 : ((e3) => {
        let t4, r2, o2 = [{}];
        for (; t4 = l.exec(e3.replace(a, "")); )
          t4[4] ? o2.shift() : t4[3] ? (r2 = t4[3].replace(n, " ").trim(), o2.unshift(o2[0][r2] = o2[0][r2] || {})) : o2[0][t4[1]] = t4[2].replace(n, " ").trim();
        return o2[0];
      })(e2);
      c[d] = o(p2 ? { ["@keyframes " + d]: t3 } : t3, r ? "" : "." + d);
    }
    let f = r && c.g ? c.g : null;
    return r && (c.g = c[d]), ((e3, t3, r2, l2) => {
      l2 ? t3.data = t3.data.replace(l2, e3) : -1 === t3.data.indexOf(e3) && (t3.data = r2 ? e3 + t3.data : t3.data + e3);
    })(c[d], t2, i2, f), d;
  }, p = (e2, t2, r) => e2.reduce((e3, l2, a2) => {
    let n2 = t2[a2];
    if (n2 && n2.call) {
      let e4 = n2(r), t3 = e4 && e4.props && e4.props.className || /^go/.test(e4) && e4;
      n2 = t3 ? "." + t3 : e4 && "object" == typeof e4 ? e4.props ? "" : o(e4, "") : false === e4 ? "" : e4;
    }
    return e3 + l2 + (null == n2 ? "" : n2);
  }, "");
  function u(e2) {
    let r = this || {}, l2 = e2.call ? e2(r.p) : e2;
    return i(l2.unshift ? l2.raw ? p(l2, [].slice.call(arguments, 1), r.p) : l2.reduce((e3, t2) => Object.assign(e3, t2 && t2.call ? t2(r.p) : t2), {}) : l2, t(r.target), r.g, r.o, r.k);
  }
  u.bind({ g: 1 });
  let h = u.bind({ k: 1 });
  const ThemeContext = createContext();
  function ThemeProvider(props) {
    return createComponent(ThemeContext.Provider, {
      value: props.theme,
      get children() {
        return props.children;
      }
    });
  }
  function useTheme() {
    return useContext(ThemeContext);
  }
  function makeStyled(tag) {
    let _ctx = this || {};
    return (...args) => {
      const Styled = (props) => {
        const theme = useContext(ThemeContext);
        const withTheme = mergeProps(props, { theme });
        const clone = mergeProps(withTheme, {
          get class() {
            const pClass = withTheme.class, append = "class" in withTheme && /^go[0-9]+/.test(pClass);
            let className2 = u.apply(
              { target: _ctx.target, o: append, p: withTheme, g: _ctx.g },
              args
            );
            return [pClass, className2].filter(Boolean).join(" ");
          }
        });
        const [local, newProps] = splitProps(clone, ["as", "theme"]);
        const htmlProps = newProps;
        const createTag = local.as || tag;
        let el;
        if (typeof createTag === "function") {
          el = createTag(htmlProps);
        } else {
          {
            if (_ctx.g == 1) {
              el = document.createElement(createTag);
              spread(el, htmlProps);
            } else {
              el = Dynamic(mergeProps({ component: createTag }, htmlProps));
            }
          }
        }
        return el;
      };
      Styled.class = (props) => {
        return untrack(() => {
          return u.apply({ target: _ctx.target, p: props, g: _ctx.g }, args);
        });
      };
      return Styled;
    };
  }
  const styled = new Proxy(makeStyled, {
    get(target, tag) {
      return target(tag);
    }
  });
  function createGlobalStyles() {
    const fn = makeStyled.call({ g: 1 }, "div").apply(null, arguments);
    return function GlobalStyles2(props) {
      fn(props);
      return null;
    };
  }
  const common$1 = {
    close: "Close",
    openWallet: "Open wallet",
    copyLink: "Copy Link",
    linkCopied: "Link Copied",
    copied: "Copied",
    yourWallet: "Your Wallet",
    retry: "Retry",
    get: "GET",
    mobile: "Mobile",
    browserExtension: "Browser Extension",
    desktop: "Desktop"
  };
  const button$1 = {
    connectWallet: "Connect Wallet",
    dropdown: {
      copy: "Copy address",
      copied: "Address copied!",
      disconnect: "Disconnect"
    }
  };
  const notifications$1 = {
    confirm: {
      header: "Open {{ name }} to\xA0confirm the\xA0transaction."
    },
    transactionSent: {
      header: "Transaction sent",
      text: "Your transaction\xA0will be\xA0processed in\xA0a\xA0few seconds."
    },
    transactionCanceled: {
      header: "Transaction canceled",
      text: "There will be no changes to your account."
    }
  };
  const walletItem$1 = {
    walletOn: "Wallet On",
    recent: "Recent",
    installed: "Installed",
    popular: "Popular"
  };
  const walletModal$1 = {
    loading: "Loading wallets",
    wallets: "Wallets",
    mobileUniversalModal: {
      connectYourWallet: "Connect your wallet",
      openWalletOnTelegramOrSelect: "Open Wallet on Telegram or\xA0select your\xA0wallet\xA0to\xA0connect",
      openWalletOnTelegram: "Open Wallet on Telegram",
      openLink: "Open Link",
      scan: "Scan with your mobile wallet"
    },
    desktopUniversalModal: {
      connectYourWallet: "Connect your wallet",
      scan: "Scan with your mobile wallet",
      availableWallets: "Available wallets"
    },
    mobileConnectionModal: {
      showQR: "Show QR Code",
      scanQR: "Scan the\xA0QR code below with your phone\u2019s\xA0or\xA0{{ name }}\u2019s camera",
      continueIn: "Continue in {{ name }}\u2026",
      connectionDeclined: "Connection declined"
    },
    desktopConnectionModal: {
      scanQR: "Scan the\xA0QR code below with your phone\u2019s\xA0or\xA0{{ name }}\u2019s camera",
      continueInExtension: "Continue in {{ name }} browser extension\u2026",
      dontHaveExtension: "Seems you don't have installed {{ name }}\xA0browser extension",
      getWallet: "Get {{ name }}",
      continueOnDesktop: "Continue in {{ name }} on desktop\u2026",
      openWalletOnTelegram: "Open Wallet on Telegram on desktop",
      connectionDeclined: "Connection declined"
    },
    infoModal: {
      whatIsAWallet: "What is a wallet",
      secureDigitalAssets: "Secure digital assets storage",
      walletProtects: "A wallet protects and manages your digital assets\xA0including TON, tokens and collectables.",
      controlIdentity: "Control your Web3 identity",
      manageIdentity: "Manage your digital identity and access decentralized applications with ease. Maintain control over your data and engage securely in\xA0the\xA0blockchain ecosystem.",
      effortlessCryptoTransactions: "Effortless crypto transactions",
      easilySend: "Easily send, receive, monitor your cryptocurrencies.\xA0Streamline your operations with\xA0decentralized applications.",
      getAWallet: "Get a Wallet"
    }
  };
  const actionModal$1 = {
    confirmTransaction: {
      header: "Confirm the\xA0transaction in\xA0{{ name }}",
      text: "It will only take a\xA0moment."
    },
    transactionSent: "$notifications.transactionSent",
    transactionCanceled: "$notifications.transactionCanceled"
  };
  const en = {
    common: common$1,
    button: button$1,
    notifications: notifications$1,
    walletItem: walletItem$1,
    walletModal: walletModal$1,
    actionModal: actionModal$1
  };
  const common = {
    close: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C",
    openWallet: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u043E\u0448\u0435\u043B\u0435\u043A",
    copyLink: "\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443",
    linkCopied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
    copied: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
    yourWallet: "\u0412\u0430\u0448 \u043A\u043E\u0448\u0435\u043B\u0435\u043A",
    retry: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C",
    get: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C",
    mobile: "\u041C\u043E\u0431\u0438\u043B\u044C\u043D\u044B\u0439",
    browserExtension: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435",
    desktop: "\u0414\u0435\u0441\u043A\u0442\u043E\u043F"
  };
  const button = {
    connectWallet: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043A\u043E\u0448\u0435\u043B\u0451\u043A",
    dropdown: {
      copy: "\u0421\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0430\u0434\u0440\u0435\u0441",
      copied: "\u0410\u0434\u0440\u0435\u0441 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D!",
      disconnect: "\u041E\u0442\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u043A\u043E\u0448\u0435\u043B\u0451\u043A"
    }
  };
  const notifications = {
    confirm: {
      header: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 {{ name }}, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044E."
    },
    transactionSent: {
      header: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430",
      text: "\u0412\u0430\u0448\u0430 \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F\xA0\u0431\u0443\u0434\u0435\u0442 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u0430 \u0447\u0435\u0440\u0435\u0437\xA0\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0441\u0435\u043A\u0443\u043D\u0434."
    },
    transactionCanceled: {
      header: "\u0422\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430",
      text: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0432\u0430\u0448\u0435\u0433\u043E \u0441\u0447\u0451\u0442\u0430 \u043D\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u0441\u044F."
    }
  };
  const walletItem = {
    walletOn: "Wallet \u0432",
    recent: "\u041D\u0435\u0434\u0430\u0432\u043D\u0438\u0439",
    installed: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E",
    popular: "\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u043E"
  };
  const walletModal = {
    loading: "\u041A\u043E\u0448\u0435\u043B\u044C\u043A\u0438 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u044E\u0442\u0441\u044F",
    wallets: "\u041A\u043E\u0448\u0435\u043B\u044C\u043A\u0438",
    mobileUniversalModal: {
      connectYourWallet: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043A\u043E\u0448\u0435\u043B\u0435\u043A",
      openWalletOnTelegramOrSelect: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 Wallet \u0432 Telegram \u0438\u043B\u0438 \u0432\u044B\u0431\u0435\u0440\u0435\u0442\u0435 \u043A\u043E\u0448\u0435\u043B\u0435\u043A \u0434\u043B\u044F \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044F",
      openWalletOnTelegram: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C Wallet \u0432 Telegram",
      openLink: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443",
      scan: "\u041E\u0442\u0441\u043A\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 \u0432\u0430\u0448\u0438\u043C \u0441\u043C\u0430\u0440\u0442\u0444\u043E\u043D\u043E\u043C"
    },
    desktopUniversalModal: {
      connectYourWallet: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043A\u043E\u0448\u0435\u043B\u0435\u043A",
      scan: "\u041E\u0442\u0441\u043A\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 \u043A\u043E\u0434 \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0441\u043C\u0430\u0440\u0442\u0444\u043E\u043D\u0430",
      availableWallets: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043A\u043E\u0448\u0435\u043B\u044C\u043A\u0438"
    },
    mobileConnectionModal: {
      showQR: "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C QR-\u043A\u043E\u0434",
      scanQR: "\u041E\u0442\u0441\u043A\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 QR-\u043A\u043E\u0434 \u043D\u0438\u0436\u0435 \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 {{ name }}, \u0438\u043B\u0438 \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0441\u043C\u0430\u0440\u0442\u0444\u043E\u043D\u0430",
      continueIn: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u0435 \u0432 {{ name }}\u2026",
      connectionDeclined: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E"
    },
    desktopConnectionModal: {
      scanQR: "\u041E\u0442\u0441\u043A\u0430\u043D\u0438\u0440\u0443\u0439\u0442\u0435 QR-\u043A\u043E\u0434 \u043D\u0438\u0436\u0435 \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0432 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0438 {{ name }}, \u0438\u043B\u0438 \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0441\u043C\u0430\u0440\u0442\u0444\u043E\u043D\u0430",
      continueInExtension: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043D\u043E\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 {{ name }}",
      dontHaveExtension: "\u041F\u043E\u0445\u043E\u0436\u0435, \u0443 \u0432\u0430\u0441 \u043D\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043D\u043E\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 {{ name }}",
      getWallet: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C {{ name }}",
      continueOnDesktop: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 {{ name }} \u043D\u0430 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0435\u2026",
      openWalletOnTelegram: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C Wallet o\u0432 Telegram \u043D\u0430 \u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0435",
      connectionDeclined: "\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E"
    },
    infoModal: {
      whatIsAWallet: "\u0427\u0442\u043E \u0442\u0430\u043A\u043E\u0435 \u043A\u043E\u0448\u0435\u043B\u0435\u043A?",
      secureDigitalAssets: "\u041D\u0430\u0434\u0435\u0436\u043D\u043E\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 \u0446\u0438\u0444\u0440\u043E\u0432\u044B\u0445 \u0430\u0441\u0441\u0435\u0442\u043E\u0432",
      walletProtects: "\u041A\u043E\u0448\u0435\u043B\u0435\u043A \u0437\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u0432\u0430\u0448\u0438 \u0446\u0438\u0444\u0440\u043E\u0432\u044B\u0435 \u0430\u043A\u0442\u0438\u0432\u044B, \u0432\u043A\u043B\u044E\u0447\u0430\u044F TON, \u0442\u043E\u043A\u0435\u043D\u044B \u0438 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u044B \u043A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F, \u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u0442 \u0438\u043C\u0438.",
      controlIdentity: "\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u0432\u043E\u044E \u043B\u0438\u0447\u043D\u043E\u0441\u0442\u044C Web3",
      manageIdentity: "\u0423\u043F\u0440\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u0441\u0432\u043E\u0435\u0439 \u0446\u0438\u0444\u0440\u043E\u0432\u043E\u0439 \u0438\u0434\u0435\u043D\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0435\u0439 \u0438 \u0441 \u043B\u0435\u0433\u043A\u043E\u0441\u0442\u044C\u044E \u043F\u043E\u043B\u0443\u0447\u0430\u0439\u0442\u0435 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u0434\u0435\u0446\u0435\u043D\u0442\u0440\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u043D\u043D\u044B\u043C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F\u043C. \u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0439\u0442\u0435 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u043D\u0430\u0434 \u0441\u0432\u043E\u0438\u043C\u0438 \u0434\u0430\u043D\u043D\u044B\u043C\u0438 \u0438 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E \u0443\u0447\u0430\u0441\u0442\u0432\u0443\u0439\u0442\u0435 \u0432\xA0\u044D\u043A\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0435\xA0\u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D\u0430.",
      effortlessCryptoTransactions: "\u041F\u0440\u043E\u0441\u0442\u044B\u0435 \u043A\u0440\u0438\u043F\u0442\u043E\u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0438",
      easilySend: "\u041B\u0435\u0433\u043A\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0439\u0442\u0435, \u043F\u043E\u043B\u0443\u0447\u0430\u0439\u0442\u0435 \u0438 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u0441\u0432\u043E\u0438 \u043A\u0440\u0438\u043F\u0442\u043E\u0432\u0430\u043B\u044E\u0442\u044B. \u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0438\u0440\u0443\u0439\u0442\u0435 \u0441\u0432\u043E\u0438 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0438 \u0441 \u043F\u043E\u043C\u043E\u0449\u044C\u044E \u0434\u0435\u0446\u0435\u043D\u0442\u0440\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0439.",
      getAWallet: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043A\u043E\u0448\u0435\u043B\u0435\u043A"
    }
  };
  const actionModal = {
    confirmTransaction: {
      header: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0432\xA0{{ name }}",
      text: "\u042D\u0442\u043E \u0437\u0430\u0439\u043C\u0435\u0442 \u043F\u0430\u0440\u0443 \u0441\u0435\u043A\u0443\u043D\u0434."
    },
    transactionSent: "$notifications.transactionSent",
    transactionCanceled: "$notifications.transactionCanceled"
  };
  const ru = {
    common,
    button,
    notifications,
    walletItem,
    walletModal,
    actionModal
  };
  const i18nDictionary = {
    en: parseDictionary(en),
    ru: parseDictionary(ru)
  };
  function parseDictionary(dictionary) {
    const refSymbol = "$";
    const iterate = (subDictionary) => {
      Object.entries(subDictionary).forEach(([key, value]) => {
        if (typeof value === "object" && value) {
          return iterate(value);
        }
        if (typeof value === "string") {
          if (value[0] === refSymbol) {
            const path = value.slice(1).split(".");
            let obj = dictionary;
            path.forEach((item) => {
              if (item in obj) {
                obj = obj[item];
              } else {
                throw new Error(
                  `Cannot parse translations: there is no property ${item} in translation`
                );
              }
            });
            subDictionary[key] = obj;
          }
          if (value.slice(0, 2) === `\\${refSymbol}`) {
            subDictionary[key] = value.slice(1);
          }
        }
      });
    };
    iterate(dictionary);
    return dictionary;
  }
  const ConnectorContext = createContext();
  const $RAW = Symbol("store-raw"), $NODE = Symbol("store-node"), $NAME = Symbol("store-name");
  function wrap$1(value, name) {
    let p2 = value[$PROXY];
    if (!p2) {
      Object.defineProperty(value, $PROXY, {
        value: p2 = new Proxy(value, proxyTraps$1)
      });
      if (!Array.isArray(value)) {
        const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
        for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
          const prop = keys[i2];
          if (desc[prop].get) {
            Object.defineProperty(value, prop, {
              enumerable: desc[prop].enumerable,
              get: desc[prop].get.bind(p2)
            });
          }
        }
      }
    }
    return p2;
  }
  function isWrappable(obj) {
    let proto;
    return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
  }
  function unwrap(item, set = /* @__PURE__ */ new Set()) {
    let result, unwrapped, v, prop;
    if (result = item != null && item[$RAW])
      return result;
    if (!isWrappable(item) || set.has(item))
      return item;
    if (Array.isArray(item)) {
      if (Object.isFrozen(item))
        item = item.slice(0);
      else
        set.add(item);
      for (let i2 = 0, l2 = item.length; i2 < l2; i2++) {
        v = item[i2];
        if ((unwrapped = unwrap(v, set)) !== v)
          item[i2] = unwrapped;
      }
    } else {
      if (Object.isFrozen(item))
        item = Object.assign({}, item);
      else
        set.add(item);
      const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
      for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
        prop = keys[i2];
        if (desc[prop].get)
          continue;
        v = item[prop];
        if ((unwrapped = unwrap(v, set)) !== v)
          item[prop] = unwrapped;
      }
    }
    return item;
  }
  function getDataNodes(target) {
    let nodes = target[$NODE];
    if (!nodes)
      Object.defineProperty(target, $NODE, {
        value: nodes = {}
      });
    return nodes;
  }
  function getDataNode(nodes, property, value) {
    return nodes[property] || (nodes[property] = createDataNode(value));
  }
  function proxyDescriptor$1(target, property) {
    const desc = Reflect.getOwnPropertyDescriptor(target, property);
    if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE || property === $NAME)
      return desc;
    delete desc.value;
    delete desc.writable;
    desc.get = () => target[$PROXY][property];
    return desc;
  }
  function trackSelf(target) {
    if (getListener()) {
      const nodes = getDataNodes(target);
      (nodes._ || (nodes._ = createDataNode()))();
    }
  }
  function ownKeys(target) {
    trackSelf(target);
    return Reflect.ownKeys(target);
  }
  function createDataNode(value) {
    const [s2, set] = createSignal(value, {
      equals: false,
      internal: true
    });
    s2.$ = set;
    return s2;
  }
  const proxyTraps$1 = {
    get(target, property, receiver) {
      if (property === $RAW)
        return target;
      if (property === $PROXY)
        return receiver;
      if (property === $TRACK) {
        trackSelf(target);
        return receiver;
      }
      const nodes = getDataNodes(target);
      const tracked = nodes.hasOwnProperty(property);
      let value = tracked ? nodes[property]() : target[property];
      if (property === $NODE || property === "__proto__")
        return value;
      if (!tracked) {
        const desc = Object.getOwnPropertyDescriptor(target, property);
        if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property)) && !(desc && desc.get))
          value = getDataNode(nodes, property, value)();
      }
      return isWrappable(value) ? wrap$1(value) : value;
    },
    has(target, property) {
      if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === "__proto__")
        return true;
      this.get(target, property, target);
      return property in target;
    },
    set() {
      return true;
    },
    deleteProperty() {
      return true;
    },
    ownKeys,
    getOwnPropertyDescriptor: proxyDescriptor$1
  };
  function setProperty(state, property, value, deleting = false) {
    if (!deleting && state[property] === value)
      return;
    const prev = state[property], len = state.length;
    if (value === void 0)
      delete state[property];
    else
      state[property] = value;
    let nodes = getDataNodes(state), node;
    if (node = getDataNode(nodes, property, prev))
      node.$(() => value);
    if (Array.isArray(state) && state.length !== len)
      (node = getDataNode(nodes, "length", len)) && node.$(state.length);
    (node = nodes._) && node.$();
  }
  function mergeStoreNode(state, value) {
    const keys = Object.keys(value);
    for (let i2 = 0; i2 < keys.length; i2 += 1) {
      const key = keys[i2];
      setProperty(state, key, value[key]);
    }
  }
  function updateArray(current, next) {
    if (typeof next === "function")
      next = next(current);
    next = unwrap(next);
    if (Array.isArray(next)) {
      if (current === next)
        return;
      let i2 = 0, len = next.length;
      for (; i2 < len; i2++) {
        const value = next[i2];
        if (current[i2] !== value)
          setProperty(current, i2, value);
      }
      setProperty(current, "length", len);
    } else
      mergeStoreNode(current, next);
  }
  function updatePath(current, path, traversed = []) {
    let part, prev = current;
    if (path.length > 1) {
      part = path.shift();
      const partType = typeof part, isArray = Array.isArray(current);
      if (Array.isArray(part)) {
        for (let i2 = 0; i2 < part.length; i2++) {
          updatePath(current, [part[i2]].concat(path), traversed);
        }
        return;
      } else if (isArray && partType === "function") {
        for (let i2 = 0; i2 < current.length; i2++) {
          if (part(current[i2], i2))
            updatePath(current, [i2].concat(path), traversed);
        }
        return;
      } else if (isArray && partType === "object") {
        const {
          from = 0,
          to = current.length - 1,
          by = 1
        } = part;
        for (let i2 = from; i2 <= to; i2 += by) {
          updatePath(current, [i2].concat(path), traversed);
        }
        return;
      } else if (path.length > 1) {
        updatePath(current[part], path, [part].concat(traversed));
        return;
      }
      prev = current[part];
      traversed = [part].concat(traversed);
    }
    let value = path[0];
    if (typeof value === "function") {
      value = value(prev, traversed);
      if (value === prev)
        return;
    }
    if (part === void 0 && value == void 0)
      return;
    value = unwrap(value);
    if (part === void 0 || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) {
      mergeStoreNode(prev, value);
    } else
      setProperty(current, part, value);
  }
  function createStore(...[store, options]) {
    const unwrappedStore = unwrap(store || {});
    const isArray = Array.isArray(unwrappedStore);
    const wrappedStore = wrap$1(unwrappedStore);
    function setStore(...args) {
      batch(() => {
        isArray && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
      });
    }
    return [wrappedStore, setStore];
  }
  var THEME = /* @__PURE__ */ ((THEME2) => {
    THEME2["DARK"] = "DARK";
    THEME2["LIGHT"] = "LIGHT";
    return THEME2;
  })(THEME || {});
  const defaultLightColorsSet = {
    constant: {
      black: "#000000",
      white: "#FFFFFF"
    },
    connectButton: {
      background: "#0098EA",
      foreground: "#FFFFFF"
    },
    accent: "#0098EA",
    telegramButton: "#0098EA",
    icon: {
      primary: "#0F0F0F",
      secondary: "#7A8999",
      tertiary: "#C1CAD2",
      success: "#29CC6A",
      error: "#F5A73B"
    },
    background: {
      primary: "#FFFFFF",
      secondary: "#F1F3F5",
      segment: "#FFFFFF",
      tint: "#F1F3F5",
      qr: "#F1F3F5"
    },
    text: {
      primary: "#0F0F0F",
      secondary: "#6A7785"
    }
  };
  const defaultDarkColorsSet = {
    constant: {
      black: "#000000",
      white: "#FFFFFF"
    },
    connectButton: {
      background: "#0098EA",
      foreground: "#FFFFFF"
    },
    accent: "#E5E5EA",
    telegramButton: "#31A6F5",
    icon: {
      primary: "#E5E5EA",
      secondary: "#909099",
      tertiary: "#434347",
      success: "#29CC6A",
      error: "#F5A73B"
    },
    background: {
      primary: "#121214",
      secondary: "#18181A",
      segment: "#262629",
      tint: "#222224",
      qr: "#FFFFFF"
    },
    text: {
      primary: "#E5E5EA",
      secondary: "#7D7D85"
    }
  };
  /*!
   * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
   *
   * Copyright (c) 2014-2017, Jon Schlinkert.
   * Released under the MIT License.
   */
  function isObject(o2) {
    return Object.prototype.toString.call(o2) === "[object Object]";
  }
  function isPlainObject(o2) {
    var ctor, prot;
    if (isObject(o2) === false)
      return false;
    ctor = o2.constructor;
    if (ctor === void 0)
      return true;
    prot = ctor.prototype;
    if (isObject(prot) === false)
      return false;
    if (prot.hasOwnProperty("isPrototypeOf") === false) {
      return false;
    }
    return true;
  }
  function mergeOptions(options, defaultOptions) {
    if (!options) {
      return defaultOptions;
    }
    const overwriteMerge = (_, sourceArray, __) => sourceArray;
    return deepmerge__default.default(defaultOptions, options, {
      arrayMerge: overwriteMerge,
      isMergeableObject: isPlainObject
    });
  }
  const [themeState, setThemeState] = createStore({
    theme: THEME.LIGHT,
    colors: defaultLightColorsSet,
    borderRadius: "m"
  });
  const themeColorsMappingDefault = {
    [THEME.LIGHT]: defaultLightColorsSet,
    [THEME.DARK]: defaultDarkColorsSet
  };
  const themeCustomColors = {
    [THEME.LIGHT]: void 0,
    [THEME.DARK]: void 0
  };
  function setTheme(theme, colorsSet) {
    if (colorsSet) {
      themeCustomColors[THEME.DARK] = mergeOptions(
        colorsSet[THEME.DARK],
        themeCustomColors[THEME.DARK]
      );
      themeCustomColors[THEME.LIGHT] = mergeOptions(
        colorsSet[THEME.LIGHT],
        themeCustomColors[THEME.LIGHT]
      );
    }
    setThemeState({
      theme,
      colors: mergeOptions(themeCustomColors[theme], themeColorsMappingDefault[theme])
    });
  }
  function setBorderRadius(borderRadius) {
    setThemeState({ borderRadius });
  }
  function setColors(colorsSet) {
    themeCustomColors[THEME.DARK] = mergeOptions(
      colorsSet[THEME.DARK],
      themeCustomColors[THEME.DARK]
    );
    themeCustomColors[THEME.LIGHT] = mergeOptions(
      colorsSet[THEME.LIGHT],
      themeCustomColors[THEME.LIGHT]
    );
    setThemeState((state) => ({
      colors: mergeOptions(
        themeCustomColors[state.theme],
        themeColorsMappingDefault[state.theme]
      )
    }));
  }
  const globalStylesTag = "tc-root";
  const disableScrollClass = "tc-disable-scroll";
  const usingMouseClass = "tc-using-mouse";
  const GlobalStyles = () => {
    document.body.addEventListener("mousedown", () => document.body.classList.add(usingMouseClass));
    document.body.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        document.body.classList.remove(usingMouseClass);
      }
    });
    const Styles = createGlobalStyles`
    ${globalStylesTag} * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        
        font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, Tahoma, Verdana, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;        
        -webkit-tap-highlight-color: transparent;
    }
    
    ${globalStylesTag} img {
      -webkit-user-select: none;
      -webkit-touch-callout: none;
    }   
 
    ${globalStylesTag} *:focus {
        outline: #08f auto 2px;
    }
    
    ${globalStylesTag} li {
        list-style: none;
    }
    
    ${globalStylesTag} button {
        outline: none;
    }
    
    body.${disableScrollClass} {
        position: fixed; 
        overflow-y: scroll;
        right: 0;
        left: 0;
    }
    
    body.${usingMouseClass} ${globalStylesTag} *:focus {
        outline: none;
    }
`;
    return createComponent(Styles, {});
  };
  const ImagePlaceholder = styled.div`
    background-color: ${(props) => props.theme.colors.background.secondary};
`;
  const Image = (props) => {
    let imgRef;
    const [image, setImage] = createSignal(null);
    createEffect(() => {
      const img = new window.Image();
      img.src = props.src;
      img.alt = props.alt || "";
      img.setAttribute("draggable", "false");
      if (props.class) {
        img.classList.add(props.class);
      }
      if (img.complete) {
        return setImage(img);
      }
      img.addEventListener("load", () => setImage(img));
      return () => img.removeEventListener("load", () => setImage(img));
    });
    return [createComponent(Show, {
      get when() {
        return image();
      },
      get children() {
        return image();
      }
    }), createComponent(Show, {
      get when() {
        return !image();
      },
      get children() {
        return createComponent(ImagePlaceholder, {
          get ["class"]() {
            return props.class;
          },
          ref(r$) {
            const _ref$ = imgRef;
            typeof _ref$ === "function" ? _ref$(r$) : imgRef = r$;
          }
        });
      }
    })];
  };
  function hexToRgb(hex) {
    if (hex[0] === "#") {
      hex = hex.slice(1);
    }
    const bigint = parseInt(hex, 16);
    const r = bigint >> 16 & 255;
    const g = bigint >> 8 & 255;
    const b = bigint & 255;
    return [r, g, b].join(",");
  }
  function rgba(color, opacity) {
    if (color[0] === "#") {
      color = hexToRgb(color);
    }
    return `rgba(${color}, ${opacity})`;
  }
  function toPx(value) {
    return value.toString() + "px";
  }
  class TonConnectUIError extends sdk.TonConnectError {
    constructor(...args) {
      super(...args);
      Object.setPrototypeOf(this, TonConnectUIError.prototype);
    }
  }
  function openLink(href, target = "_self") {
    return window.open(href, target, "noreferrer noopener");
  }
  function openLinkBlank(href) {
    openLink(href, "_blank");
  }
  function getSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return THEME.LIGHT;
    }
    return THEME.DARK;
  }
  function subscribeToThemeChange(callback) {
    const handler = (event) => callback(event.matches ? THEME.DARK : THEME.LIGHT);
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", handler);
    return () => window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", handler);
  }
  function addQueryParameter(url, key, value) {
    const parsed = new URL(url);
    parsed.searchParams.append(key, value);
    return parsed.toString();
  }
  function addReturnStrategy(url, returnStrategy) {
    return addQueryParameter(url, "ret", returnStrategy);
  }
  function disableScroll() {
    if (document.documentElement.scrollHeight === document.documentElement.clientHeight) {
      return;
    }
    document.body.style.top = toPx(-document.documentElement.scrollTop);
    document.body.classList.add(disableScrollClass);
  }
  function enableScroll() {
    document.body.classList.remove(disableScrollClass);
    document.documentElement.scrollTo({ top: -parseFloat(getComputedStyle(document.body).top) });
    document.body.style.top = "auto";
  }
  function fixMobileSafariActiveTransition() {
    if (!document.body.hasAttribute("ontouchstart")) {
      document.body.setAttribute("ontouchstart", "");
    }
  }
  function defineStylesRoot() {
    customElements.define(globalStylesTag, class TcRootElement extends HTMLDivElement {
    }, {
      extends: "div"
    });
  }
  function preloadImages(images) {
    images.forEach((img) => {
      const node = new window.Image();
      node.src = img;
    });
  }
  function checkLocalStorageExists() {
    if (typeof localStorage === "undefined") {
      throw new TonConnectUIError(
        "window.localStorage is undefined. localStorage is required for TonConnectUI"
      );
    }
  }
  function getWindow$1() {
    if (typeof window !== "undefined") {
      return window;
    }
    return void 0;
  }
  function getUserAgent() {
    var _a2, _b2;
    const results = new UAParser__default.default().getResult();
    const osName = (_a2 = results.os.name) == null ? void 0 : _a2.toLowerCase();
    let os;
    switch (true) {
      case osName === "ios":
        os = "ios";
        break;
      case osName === "android":
        os = "android";
        break;
      case osName === "mac os":
        os = "macos";
        break;
      case osName === "linux":
        os = "linux";
        break;
      case (osName == null ? void 0 : osName.includes("windows")):
        os = "windows";
        break;
    }
    const browserName = (_b2 = results.browser.name) == null ? void 0 : _b2.toLowerCase();
    let browser;
    switch (true) {
      case browserName === "chrome":
        browser = "chrome";
        break;
      case browserName === "firefox":
        browser = "firefox";
        break;
      case (browserName == null ? void 0 : browserName.includes("safari")):
        browser = "safari";
        break;
    }
    return {
      os,
      browser
    };
  }
  const maxWidth = {
    mobile: 440,
    tablet: 1020
  };
  function isDevice(device) {
    const window2 = getWindow$1();
    if (!window2) {
      return device === "desktop";
    }
    const width = window2.innerWidth;
    switch (device) {
      case "desktop":
        return width > maxWidth.tablet;
      case "tablet":
        return width > maxWidth.mobile;
      default:
      case "mobile":
        return width <= maxWidth.mobile;
    }
  }
  function media(device) {
    switch (device) {
      case "mobile":
        return `@media (max-width: ${maxWidth.mobile}px)`;
      case "tablet":
        return `@media (max-width: ${maxWidth.tablet}px) (min-width: ${maxWidth.mobile}px)`;
      default:
      case "desktop":
        return `@media (min-width: ${maxWidth.tablet}px)`;
    }
  }
  const mediaTouch = "@media (hover: none)";
  const mediaNotTouch = "@media not all and (hover: none)";
  const borders$5 = {
    m: "100vh",
    s: "8px",
    none: "0"
  };
  const scaleValues = {
    s: 0.02,
    m: 0.04
  };
  const ButtonStyled$1 = styled.button`
    display: ${(props) => props.leftIcon || props.rightIcon ? "flex" : "inline-block"};
    gap: ${(props) => props.leftIcon || props.rightIcon ? "6px" : "unset"};
    align-items: ${(props) => props.leftIcon || props.rightIcon ? "center" : "unset"};
    justify-content: ${(props) => props.leftIcon || props.rightIcon ? "space-between" : "unset"};
    background-color: ${(props) => props.appearance === "flat" ? "transparent" : props.appearance === "secondary" ? props.theme.colors.background.tint : rgba(props.theme.colors.accent, 0.12)};
    color: ${(props) => props.appearance === "secondary" ? props.theme.colors.text.primary : props.theme.colors.accent};

    padding: ${(props) => props.appearance === "flat" ? "0" : "9px 16px"};
    padding-left: ${(props) => props.leftIcon && props.appearance !== "flat" ? "12px" : "16px"};
    padding-right: ${(props) => props.rightIcon && props.appearance !== "flat" ? "12px" : "16px"};
    border: none;
    border-radius: ${(props) => borders$5[props.theme.borderRadius]};
    cursor: ${(props) => props.disabled ? "not-allowed" : "pointer"};

    font-size: 14px;
    font-weight: 590;
    line-height: 18px;

    transition: transform 0.125s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: ${(props) => props.disabled ? "unset" : `scale(${1 + scaleValues[props.scale]})`};
        }
    }

    &:active {
        transform: ${(props) => props.disabled ? "unset" : `scale(${1 - scaleValues[props.scale]})`};
    }

    ${mediaTouch} {
        &:active {
            transform: ${(props) => props.disabled ? "unset" : `scale(${1 - scaleValues[props.scale] * 2})`};
        }
    }
`;
  function useDataAttributes(props) {
    const keys = untrack(() => Object.keys(props).filter((key) => key.startsWith("data-")));
    const [dataAttrs] = splitProps(props, keys);
    return dataAttrs;
  }
  const Button = (props) => {
    const dataAttrs = useDataAttributes(props);
    return createComponent(ButtonStyled$1, mergeProps({
      get appearance() {
        return props.appearance || "primary";
      },
      get ["class"]() {
        return props.class;
      },
      onClick: (e2) => {
        var _a2;
        return (_a2 = props.onClick) == null ? void 0 : _a2.call(props, e2);
      },
      onMouseEnter: (e2) => {
        var _a2;
        return (_a2 = props.onMouseEnter) == null ? void 0 : _a2.call(props, e2);
      },
      onMouseLeave: (e2) => {
        var _a2;
        return (_a2 = props.onMouseLeave) == null ? void 0 : _a2.call(props, e2);
      },
      ref(r$) {
        const _ref$ = props.ref;
        typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
      },
      get disabled() {
        return props.disabled;
      },
      get scale() {
        return props.scale || "m";
      },
      get leftIcon() {
        return !!props.leftIcon;
      },
      get rightIcon() {
        return !!props.rightIcon;
      },
      "data-tc-button": "true"
    }, dataAttrs, {
      get children() {
        return [createMemo(() => props.leftIcon), createMemo(() => props.children), createMemo(() => props.rightIcon)];
      }
    }));
  };
  function nextFrame(fn) {
    requestAnimationFrame(() => {
      requestAnimationFrame(fn);
    });
  }
  const Transition = (props) => {
    let el;
    let first = true;
    const [s1, set1] = createSignal();
    const [s2, set2] = createSignal();
    const resolved = children(() => props.children);
    const {
      onBeforeEnter,
      onEnter,
      onAfterEnter,
      onBeforeExit,
      onExit,
      onAfterExit
    } = props;
    const classnames = createMemo(() => {
      const name = props.name || "s";
      return {
        enterActiveClass: props.enterActiveClass || name + "-enter-active",
        enterClass: props.enterClass || name + "-enter",
        enterToClass: props.enterToClass || name + "-enter-to",
        exitActiveClass: props.exitActiveClass || name + "-exit-active",
        exitClass: props.exitClass || name + "-exit",
        exitToClass: props.exitToClass || name + "-exit-to"
      };
    });
    function enterTransition(el2, prev) {
      if (!first || props.appear) {
        let endTransition = function(e2) {
          if (el2 && (!e2 || e2.target === el2)) {
            el2.removeEventListener("transitionend", endTransition);
            el2.removeEventListener("animationend", endTransition);
            el2.classList.remove(...enterActiveClasses);
            el2.classList.remove(...enterToClasses);
            batch(() => {
              s1() !== el2 && set1(el2);
              s2() === el2 && set2(void 0);
            });
            onAfterEnter && onAfterEnter(el2);
            if (props.mode === "inout")
              exitTransition(el2, prev);
          }
        };
        const enterClasses = classnames().enterClass.split(" ");
        const enterActiveClasses = classnames().enterActiveClass.split(" ");
        const enterToClasses = classnames().enterToClass.split(" ");
        onBeforeEnter && onBeforeEnter(el2);
        el2.classList.add(...enterClasses);
        el2.classList.add(...enterActiveClasses);
        nextFrame(() => {
          el2.classList.remove(...enterClasses);
          el2.classList.add(...enterToClasses);
          onEnter && onEnter(el2, () => endTransition());
          if (!onEnter || onEnter.length < 2) {
            el2.addEventListener("transitionend", endTransition);
            el2.addEventListener("animationend", endTransition);
          }
        });
      }
      prev && !props.mode ? set2(el2) : set1(el2);
    }
    function exitTransition(el2, prev) {
      const exitClasses = classnames().exitClass.split(" ");
      const exitActiveClasses = classnames().exitActiveClass.split(" ");
      const exitToClasses = classnames().exitToClass.split(" ");
      if (!prev.parentNode)
        return endTransition();
      onBeforeExit && onBeforeExit(prev);
      prev.classList.add(...exitClasses);
      prev.classList.add(...exitActiveClasses);
      nextFrame(() => {
        prev.classList.remove(...exitClasses);
        prev.classList.add(...exitToClasses);
      });
      onExit && onExit(prev, () => endTransition());
      if (!onExit || onExit.length < 2) {
        prev.addEventListener("transitionend", endTransition);
        prev.addEventListener("animationend", endTransition);
      }
      function endTransition(e2) {
        if (!e2 || e2.target === prev) {
          prev.removeEventListener("transitionend", endTransition);
          prev.removeEventListener("animationend", endTransition);
          prev.classList.remove(...exitActiveClasses);
          prev.classList.remove(...exitToClasses);
          s1() === prev && set1(void 0);
          onAfterExit && onAfterExit(prev);
          if (props.mode === "outin")
            enterTransition(el2, prev);
        }
      }
    }
    createComputed((prev) => {
      el = resolved();
      while (typeof el === "function")
        el = el();
      return untrack(() => {
        if (el && el !== prev) {
          if (props.mode !== "outin")
            enterTransition(el, prev);
          else if (first)
            set1(el);
        }
        if (prev && prev !== el && props.mode !== "inout")
          exitTransition(el, prev);
        first = false;
        return el;
      });
    });
    return [s1, s2];
  };
  function getRect(element) {
    const {
      top,
      bottom,
      left,
      right,
      width,
      height
    } = element.getBoundingClientRect();
    const parentRect = element.parentNode.getBoundingClientRect();
    return {
      top: top - parentRect.top,
      bottom,
      left: left - parentRect.left,
      right,
      width,
      height
    };
  }
  const TransitionGroup = (props) => {
    const resolved = children(() => props.children);
    const classnames = createMemo(() => {
      const name = props.name || "s";
      return {
        enterActiveClass: props.enterActiveClass || name + "-enter-active",
        enterClass: props.enterClass || name + "-enter",
        enterToClass: props.enterToClass || name + "-enter-to",
        exitActiveClass: props.exitActiveClass || name + "-exit-active",
        exitClass: props.exitClass || name + "-exit",
        exitToClass: props.exitToClass || name + "-exit-to",
        moveClass: props.moveClass || name + "-move"
      };
    });
    const {
      onBeforeEnter,
      onEnter,
      onAfterEnter,
      onBeforeExit,
      onExit,
      onAfterExit
    } = props;
    const [combined, setCombined] = createSignal();
    let p2 = [];
    let first = true;
    createComputed(() => {
      const c2 = resolved();
      const comb = [...c2];
      const next = new Set(c2);
      const prev = new Set(p2);
      const enterClasses = classnames().enterClass.split(" ");
      const enterActiveClasses = classnames().enterActiveClass.split(" ");
      const enterToClasses = classnames().enterToClass.split(" ");
      const exitClasses = classnames().exitClass.split(" ");
      const exitActiveClasses = classnames().exitActiveClass.split(" ");
      const exitToClasses = classnames().exitToClass.split(" ");
      for (let i2 = 0; i2 < c2.length; i2++) {
        const el = c2[i2];
        if (!first && !prev.has(el)) {
          let endTransition = function(e2) {
            if (el && (!e2 || e2.target === el)) {
              el.removeEventListener("transitionend", endTransition);
              el.removeEventListener("animationend", endTransition);
              el.classList.remove(...enterActiveClasses);
              el.classList.remove(...enterToClasses);
              onAfterEnter && onAfterEnter(el);
            }
          };
          onBeforeEnter && onBeforeEnter(el);
          el.classList.add(...enterClasses);
          el.classList.add(...enterActiveClasses);
          nextFrame(() => {
            el.classList.remove(...enterClasses);
            el.classList.add(...enterToClasses);
            onEnter && onEnter(el, () => endTransition());
            if (!onEnter || onEnter.length < 2) {
              el.addEventListener("transitionend", endTransition);
              el.addEventListener("animationend", endTransition);
            }
          });
        }
      }
      for (let i2 = 0; i2 < p2.length; i2++) {
        const old = p2[i2];
        if (!next.has(old) && old.parentNode) {
          let endTransition = function(e2) {
            if (!e2 || e2.target === old) {
              old.removeEventListener("transitionend", endTransition);
              old.removeEventListener("animationend", endTransition);
              old.classList.remove(...exitActiveClasses);
              old.classList.remove(...exitToClasses);
              onAfterExit && onAfterExit(old);
              p2 = p2.filter((i3) => i3 !== old);
              setCombined(p2);
            }
          };
          comb.splice(i2, 0, old);
          onBeforeExit && onBeforeExit(old);
          old.classList.add(...exitClasses);
          old.classList.add(...exitActiveClasses);
          nextFrame(() => {
            old.classList.remove(...exitClasses);
            old.classList.add(...exitToClasses);
          });
          onExit && onExit(old, () => endTransition());
          if (!onExit || onExit.length < 2) {
            old.addEventListener("transitionend", endTransition);
            old.addEventListener("animationend", endTransition);
          }
        }
      }
      p2 = comb;
      setCombined(comb);
    });
    createEffect((nodes) => {
      const c2 = combined();
      c2.forEach((child) => {
        let n2;
        if (!(n2 = nodes.get(child))) {
          nodes.set(child, n2 = {
            pos: getRect(child),
            new: !first
          });
        } else if (n2.new) {
          n2.new = false;
          n2.newPos = getRect(child);
        }
        if (n2.new) {
          child.addEventListener("transitionend", () => {
            n2.new = false;
            child.parentNode && (n2.newPos = getRect(child));
          }, {
            once: true
          });
        }
        n2.newPos && (n2.pos = n2.newPos);
        n2.newPos = getRect(child);
      });
      if (first) {
        first = false;
        return nodes;
      }
      c2.forEach((child) => {
        const c3 = nodes.get(child);
        const oldPos = c3.pos;
        const newPos = c3.newPos;
        const dx = oldPos.left - newPos.left;
        const dy = oldPos.top - newPos.top;
        if (dx || dy) {
          c3.moved = true;
          const s2 = child.style;
          s2.transform = `translate(${dx}px,${dy}px)`;
          s2.transitionDuration = "0s";
        }
      });
      document.body.offsetHeight;
      c2.forEach((child) => {
        const c3 = nodes.get(child);
        if (c3.moved) {
          let endTransition = function(e2) {
            if (e2 && e2.target !== child || !child.parentNode)
              return;
            if (!e2 || /transform$/.test(e2.propertyName)) {
              child.removeEventListener("transitionend", endTransition);
              child.classList.remove(...moveClasses);
            }
          };
          c3.moved = false;
          const s2 = child.style;
          const moveClasses = classnames().moveClass.split(" ");
          child.classList.add(...moveClasses);
          s2.transform = s2.transitionDuration = "";
          child.addEventListener("transitionend", endTransition);
        }
      });
      return nodes;
    }, /* @__PURE__ */ new Map());
    return combined;
  };
  function clickOutside$1(el, accessor) {
    const onClick = (e2) => {
      var _a2;
      return !el.contains(e2.target) && ((_a2 = accessor()) == null ? void 0 : _a2());
    };
    document.body.addEventListener("click", onClick);
    onCleanup(() => document.body.removeEventListener("click", onClick));
  }
  function escPressed(_, accessor) {
    const onKeyPress = (e2) => {
      var _a2, _b2;
      if (e2.key === "Escape") {
        (_a2 = document.activeElement) == null ? void 0 : _a2.blur();
        (_b2 = accessor()) == null ? void 0 : _b2();
      }
    };
    document.body.addEventListener("keydown", onKeyPress);
    onCleanup(() => document.body.removeEventListener("keydown", onKeyPress));
  }
  const _tmpl$$v = /* @__PURE__ */ template$1(`<svg><path fill-rule="evenodd" clip-rule="evenodd" d="M10.2122 14.3407C10.5384 14.0854 10.5959 13.614 10.3406 13.2878L6.20237 8.00003L10.3406 2.71227C10.5959 2.38607 10.5384 1.91469 10.2122 1.6594C9.88604 1.40412 9.41465 1.46161 9.15937 1.7878L4.65937 7.5378C4.44688 7.80932 4.44688 8.19074 4.65937 8.46226L9.15937 14.2123C9.41465 14.5385 9.88604 14.5959 10.2122 14.3407Z"></path></svg>`, 4, true);
  const rotationDegrees = {
    left: 0,
    top: 90,
    right: 180,
    bottom: 270
  };
  const ArrowIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    const direction = () => props.direction || "left";
    const Svg = styled("svg")`
        transform: rotate(${(props2) => rotationDegrees[props2.svgDirection]}deg);
        transition: transform 0.1s ease-in-out;
    `;
    return createComponent(Svg, {
      xmlns: "http://www.w3.org/2000/svg",
      width: "16",
      height: "16",
      viewBox: "0 0 16 16",
      fill: "none",
      get svgDirection() {
        return direction();
      },
      get children() {
        const _el$ = _tmpl$$v.cloneNode(true);
        createRenderEffect(() => setAttribute(_el$, "fill", fill()));
        return _el$;
      }
    });
  };
  const _tmpl$$u = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.71966 2.71968C3.01255 2.42678 3.48743 2.42677 3.78032 2.71966L8.00002 6.93925L12.2197 2.71967C12.5126 2.42677 12.9874 2.42678 13.2803 2.71967C13.5732 3.01257 13.5732 3.48744 13.2803 3.78033L9.06068 7.99991L13.2803 12.2197C13.5732 12.5126 13.5732 12.9874 13.2803 13.2803C12.9874 13.5732 12.5126 13.5732 12.2197 13.2803L8.00002 9.06057L3.78033 13.2803C3.48744 13.5732 3.01257 13.5732 2.71967 13.2803C2.42678 12.9874 2.42677 12.5126 2.71967 12.2197L6.93936 7.99991L2.71968 3.78034C2.42678 3.48745 2.42677 3.01257 2.71966 2.71968Z"></path></svg>`);
  const CloseIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$u.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const IconButtonStyled = styled.button`
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: ${(props) => props.theme.colors.background.tint};
    border: none;
    cursor: pointer;

    transition: transform 0.125s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.04);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.92);
        }
    }
`;
  const IconButton = (props) => {
    const dataAttrs = useDataAttributes(props);
    const icon = () => props.icon || "close";
    return createComponent(IconButtonStyled, mergeProps({
      get ["class"]() {
        return props.class;
      },
      onClick: () => props.onClick(),
      "data-tc-icon-button": "true"
    }, dataAttrs, {
      get children() {
        return [createComponent(Show, {
          get when() {
            return !!props.children;
          },
          get children() {
            return props.children;
          }
        }), createComponent(Show, {
          get when() {
            return !props.children;
          },
          get children() {
            return createComponent(Switch, {
              get children() {
                return [createComponent(Match, {
                  get when() {
                    return icon() === "close";
                  },
                  get children() {
                    return createComponent(CloseIcon, {
                      get fill() {
                        return props.fill;
                      }
                    });
                  }
                }), createComponent(Match, {
                  get when() {
                    return icon() === "arrow";
                  },
                  get children() {
                    return createComponent(ArrowIcon, {
                      get fill() {
                        return props.fill;
                      }
                    });
                  }
                }), createComponent(Match, {
                  get when() {
                    return icon() === "question";
                  },
                  get children() {
                    return createComponent(QuestionIcon, {
                      get fill() {
                        return props.fill;
                      }
                    });
                  }
                }), createComponent(Match, {
                  get when() {
                    return typeof icon() !== "string";
                  },
                  get children() {
                    return icon();
                  }
                })];
              }
            });
          }
        })];
      }
    }));
  };
  const borders$4 = {
    m: "24px",
    s: "16px",
    none: "0"
  };
  const ModalBackgroundStyled = styled.div`
    display: flex;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 20px 0;
    overflow-y: auto;

    ${media("mobile")} {
        padding-bottom: 0;
    }
`;
  const ModalWrapperClass = u`
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 16px 64px rgba(0, 0, 0, 0.16);
    width: fit-content;
    margin: auto;

    ${media("mobile")} {
        width: 100%;
        height: fit-content;
        margin: auto 0 0 0;
    }
`;
  const ModalBodyStyled = styled.div`
    position: relative;
    min-height: 100px;
    width: 416px;
    padding: 44px 56px 24px;

    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.04);

    background-color: ${(props) => props.theme.colors.background.primary};
    border-radius: ${(props) => borders$4[props.theme.borderRadius]};

    ${media("mobile")} {
        width: 100%;
    }
`;
  const CloseButtonStyled = styled(IconButton)`
    position: absolute;
    right: 16px;
    top: 16px;
`;
  const ModalFooterStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 16px 18px;
    border-radius: 0 0 ${(props) => borders$4[props.theme.borderRadius]}
        ${(props) => borders$4[props.theme.borderRadius]};
`;
  const QuestionButtonStyled = styled(IconButton)`
    background-color: ${(props) => rgba(props.theme.colors.icon.secondary, 0.12)};
`;
  const _tmpl$$t = /* @__PURE__ */ template$1(`<div></div>`);
  const clickOutside = clickOutside$1;
  const keyPressed = escPressed;
  const Modal = (props) => {
    const theme = useTheme();
    const dataAttrs = useDataAttributes(props);
    createEffect(() => {
      if (props.opened) {
        disableScroll();
      } else {
        enableScroll();
      }
    });
    return createComponent(Transition, {
      onBeforeEnter: (el) => {
        const duration = isDevice("mobile") ? 200 : 100;
        el.animate([{
          opacity: 0
        }, {
          opacity: 1
        }], {
          duration
        });
        if (isDevice("mobile")) {
          el.firstElementChild.animate([{
            transform: "translateY(390px)"
          }, {
            transform: "translateY(0)"
          }], {
            duration
          });
        }
      },
      onExit: (el, done) => {
        const duration = isDevice("mobile") ? 200 : 100;
        const backgroundAnimation = el.animate([{
          opacity: 1
        }, {
          opacity: 0
        }], {
          duration
        });
        if (isDevice("mobile")) {
          const contentAnimation = el.firstElementChild.animate([{
            transform: "translateY(0)"
          }, {
            transform: "translateY(390px)"
          }], {
            duration
          });
          Promise.all([backgroundAnimation.finished, contentAnimation.finished]).then(done);
        } else {
          backgroundAnimation.finished.then(done);
        }
      },
      get children() {
        return createComponent(Show, {
          get when() {
            return props.opened;
          },
          get children() {
            return createComponent(ModalBackgroundStyled, mergeProps({
              "data-tc-modal": "true"
            }, dataAttrs, {
              get children() {
                const _el$ = _tmpl$$t.cloneNode(true);
                use(keyPressed, _el$, () => () => props.onClose());
                use(clickOutside, _el$, () => () => props.onClose());
                insert(_el$, createComponent(ModalBodyStyled, {
                  get ["class"]() {
                    return props.class;
                  },
                  get children() {
                    return [createComponent(CloseButtonStyled, {
                      icon: "close",
                      onClick: () => props.onClose()
                    }), createMemo(() => props.children)];
                  }
                }), null);
                insert(_el$, createComponent(Show, {
                  get when() {
                    return props.onClickQuestion;
                  },
                  get children() {
                    return createComponent(ModalFooterStyled, {
                      get children() {
                        return [createComponent(TonConnectBrand, {}), createComponent(QuestionButtonStyled, {
                          get onClick() {
                            return props.onClickQuestion;
                          },
                          icon: "question"
                        })];
                      }
                    });
                  }
                }), null);
                createRenderEffect(() => className(_el$, cn__default.default(ModalWrapperClass, u`
                                border-radius: ${borders$4[theme.borderRadius]};
                                background-color: ${theme.colors.background.tint};
                                ${media("mobile")} {
                                    border-radius: ${borders$4[theme.borderRadius]}
                                        ${borders$4[theme.borderRadius]} 0 0;
                                }
                            `)));
                return _el$;
              }
            }));
          }
        });
      }
    });
  };
  const wrapperBorderRadius = {
    m: "22px",
    s: "12px",
    none: "0"
  };
  const sliderBorderRadius = {
    m: "18px",
    s: "8px",
    none: "0"
  };
  const TabBarStyled = styled.div`
    display: grid;
    grid-template: 1fr / 1fr 1fr;
    width: fit-content;
    justify-items: center;
    gap: 4px;

    position: relative;
    padding: 4px;
    border-radius: ${(props) => wrapperBorderRadius[props.theme.borderRadius]};

    background-color: ${(props) => props.theme.colors.background.secondary};
`;
  const SliderStyled = styled.div`
    position: absolute;
    top: 4px;
    left: 4px;

    height: calc(100% - 8px);
    width: calc(50% - 4px);

    border-radius: ${(props) => sliderBorderRadius[props.theme.borderRadius]};
    background-color: ${(props) => props.theme.colors.background.segment};

    transform: ${(props) => props.right ? "translateX(100%)" : "translateX(0)"};

    transition: transform 0.13s ease-in-out;
`;
  const InputStyled = styled.input`
    display: none;
`;
  const LabelStyled = styled.label`
    padding: 9px 12px;
    z-index: 1;

    cursor: ${(props) => props.isActive ? "default" : "pointer"};

    transition: transform 0.13s ease-in-out;

    &:hover {
        transform: ${(props) => props.isActive ? "none" : "scale(1.025)"};
    }

    > * {
        ${(props) => !props.isActive ? `color: ${props.theme.colors.text.secondary};` : ""}
    }
`;
  const TabBar = (props) => {
    const groupName = "tabBar" + Math.floor(Math.random() * 1e4);
    return createComponent(TabBarStyled, {
      get ["class"]() {
        return props.class;
      },
      "data-tc-tab-bar": "true",
      get children() {
        return [createComponent(SliderStyled, {
          get right() {
            return props.selectedTabIndex === 1;
          }
        }), createComponent(LabelStyled, {
          get isActive() {
            return props.selectedTabIndex === 0;
          },
          get children() {
            return [createComponent(InputStyled, {
              type: "radio",
              name: groupName,
              get checked() {
                return props.selectedTabIndex === 0;
              },
              onInput: () => {
                var _a2;
                return (_a2 = props.onSelectedTabIndexChange) == null ? void 0 : _a2.call(props, 0);
              }
            }), createMemo(() => props.tab1)];
          }
        }), createComponent(LabelStyled, {
          get isActive() {
            return props.selectedTabIndex === 1;
          },
          get children() {
            return [createComponent(InputStyled, {
              type: "radio",
              get checked() {
                return props.selectedTabIndex === 1;
              },
              name: groupName,
              onInput: () => {
                var _a2;
                return (_a2 = props.onSelectedTabIndexChange) == null ? void 0 : _a2.call(props, 1);
              }
            }), createMemo(() => props.tab2)];
          }
        })];
      }
    });
  };
  const backgroundBorders = {
    m: "16px",
    s: "12px",
    none: "0"
  };
  const imageBorders = {
    m: "12px",
    s: "8px",
    none: "0"
  };
  const qrNormalSize = 256;
  const imgSizeDefault = 60;
  const picSizeDefault = 48;
  const qrPaddingTop = 24;
  const CopyIconButton = styled.div`
    width: 52px;
    height: 52px;
    background: transparent;
    position: absolute;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.125s ease-in-out;
`;
  const QrCodeBackground = styled.button`
    display: flex;
    align-items: center;
    position: relative;
    background-color: ${(props) => props.theme.colors.background.qr};
    border-radius: ${(props) => backgroundBorders[props.theme.borderRadius]};
    padding: ${toPx(qrPaddingTop)} 0;
    height: ${toPx(qrNormalSize + qrPaddingTop * 2)};
    width: 100%;

    overflow: hidden;
    cursor: pointer;
    border: none;

    ${mediaNotTouch} {
        &:hover {
            ${CopyIconButton.class} {
                transform: scale(1.04);
            }
        }
    }

    &:active {
        ${CopyIconButton.class} {
            transform: scale(0.96);
        }
    }

    ${mediaTouch} {
        &:active {
            ${CopyIconButton.class} {
                transform: scale(0.92);
            }
        }
    }
`;
  const QrCodeWrapper$2 = styled.div`
    position: relative;

    width: fit-content;
    margin: 0 auto;

    > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    rect {
        fill: transparent;
    }

    path {
        fill: ${(props) => props.theme.colors.constant.black};
    }
`;
  const ImageBackground = styled.div`
    position: absolute;
    width: ${toPx(imgSizeDefault)};
    height: ${toPx(imgSizeDefault)};
    background: ${(props) => props.theme.colors.background.qr};

    display: flex;
    align-items: center;
    justify-content: center;
`;
  const ImageStyled$3 = styled(Image)`
    width: ${(props) => toPx(props.size)};
    height: ${(props) => toPx(props.size)};
    border-radius: ${(props) => imageBorders[props.theme.borderRadius]};
    background-color: ${(props) => props.theme.colors.background.qr};
`;
  const CopiedBoxStyled = styled.div`
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translate(-50%, 0);

    display: flex;
    gap: 6px;
    align-items: center;
    border-radius: 18px;
    min-width: 126px;
    padding: 9px 16px 9px 10px;

    filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.08));
    background-color: ${(props) => props.theme.colors.background.segment};
`;
  var qrcode$1 = { exports: {} };
  (function(module2, exports3) {
    var qrcode2 = function() {
      var qrcode3 = function(typeNumber, errorCorrectionLevel) {
        var PAD0 = 236;
        var PAD1 = 17;
        var _typeNumber = typeNumber;
        var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
        var _modules = null;
        var _moduleCount = 0;
        var _dataCache = null;
        var _dataList = [];
        var _this = {};
        var makeImpl = function(test, maskPattern) {
          _moduleCount = _typeNumber * 4 + 17;
          _modules = function(moduleCount) {
            var modules = new Array(moduleCount);
            for (var row = 0; row < moduleCount; row += 1) {
              modules[row] = new Array(moduleCount);
              for (var col = 0; col < moduleCount; col += 1) {
                modules[row][col] = null;
              }
            }
            return modules;
          }(_moduleCount);
          setupPositionProbePattern(0, 0);
          setupPositionProbePattern(_moduleCount - 7, 0);
          setupPositionProbePattern(0, _moduleCount - 7);
          setupPositionAdjustPattern();
          setupTimingPattern();
          setupTypeInfo(test, maskPattern);
          if (_typeNumber >= 7) {
            setupTypeNumber(test);
          }
          if (_dataCache == null) {
            _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
          }
          mapData(_dataCache, maskPattern);
        };
        var setupPositionProbePattern = function(row, col) {
          for (var r = -1; r <= 7; r += 1) {
            if (row + r <= -1 || _moduleCount <= row + r)
              continue;
            for (var c2 = -1; c2 <= 7; c2 += 1) {
              if (col + c2 <= -1 || _moduleCount <= col + c2)
                continue;
              if (0 <= r && r <= 6 && (c2 == 0 || c2 == 6) || 0 <= c2 && c2 <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c2 && c2 <= 4) {
                _modules[row + r][col + c2] = true;
              } else {
                _modules[row + r][col + c2] = false;
              }
            }
          }
        };
        var getBestMaskPattern = function() {
          var minLostPoint = 0;
          var pattern = 0;
          for (var i2 = 0; i2 < 8; i2 += 1) {
            makeImpl(true, i2);
            var lostPoint = QRUtil.getLostPoint(_this);
            if (i2 == 0 || minLostPoint > lostPoint) {
              minLostPoint = lostPoint;
              pattern = i2;
            }
          }
          return pattern;
        };
        var setupTimingPattern = function() {
          for (var r = 8; r < _moduleCount - 8; r += 1) {
            if (_modules[r][6] != null) {
              continue;
            }
            _modules[r][6] = r % 2 == 0;
          }
          for (var c2 = 8; c2 < _moduleCount - 8; c2 += 1) {
            if (_modules[6][c2] != null) {
              continue;
            }
            _modules[6][c2] = c2 % 2 == 0;
          }
        };
        var setupPositionAdjustPattern = function() {
          var pos = QRUtil.getPatternPosition(_typeNumber);
          for (var i2 = 0; i2 < pos.length; i2 += 1) {
            for (var j = 0; j < pos.length; j += 1) {
              var row = pos[i2];
              var col = pos[j];
              if (_modules[row][col] != null) {
                continue;
              }
              for (var r = -2; r <= 2; r += 1) {
                for (var c2 = -2; c2 <= 2; c2 += 1) {
                  if (r == -2 || r == 2 || c2 == -2 || c2 == 2 || r == 0 && c2 == 0) {
                    _modules[row + r][col + c2] = true;
                  } else {
                    _modules[row + r][col + c2] = false;
                  }
                }
              }
            }
          }
        };
        var setupTypeNumber = function(test) {
          var bits = QRUtil.getBCHTypeNumber(_typeNumber);
          for (var i2 = 0; i2 < 18; i2 += 1) {
            var mod = !test && (bits >> i2 & 1) == 1;
            _modules[Math.floor(i2 / 3)][i2 % 3 + _moduleCount - 8 - 3] = mod;
          }
          for (var i2 = 0; i2 < 18; i2 += 1) {
            var mod = !test && (bits >> i2 & 1) == 1;
            _modules[i2 % 3 + _moduleCount - 8 - 3][Math.floor(i2 / 3)] = mod;
          }
        };
        var setupTypeInfo = function(test, maskPattern) {
          var data = _errorCorrectionLevel << 3 | maskPattern;
          var bits = QRUtil.getBCHTypeInfo(data);
          for (var i2 = 0; i2 < 15; i2 += 1) {
            var mod = !test && (bits >> i2 & 1) == 1;
            if (i2 < 6) {
              _modules[i2][8] = mod;
            } else if (i2 < 8) {
              _modules[i2 + 1][8] = mod;
            } else {
              _modules[_moduleCount - 15 + i2][8] = mod;
            }
          }
          for (var i2 = 0; i2 < 15; i2 += 1) {
            var mod = !test && (bits >> i2 & 1) == 1;
            if (i2 < 8) {
              _modules[8][_moduleCount - i2 - 1] = mod;
            } else if (i2 < 9) {
              _modules[8][15 - i2 - 1 + 1] = mod;
            } else {
              _modules[8][15 - i2 - 1] = mod;
            }
          }
          _modules[_moduleCount - 8][8] = !test;
        };
        var mapData = function(data, maskPattern) {
          var inc = -1;
          var row = _moduleCount - 1;
          var bitIndex = 7;
          var byteIndex = 0;
          var maskFunc = QRUtil.getMaskFunction(maskPattern);
          for (var col = _moduleCount - 1; col > 0; col -= 2) {
            if (col == 6)
              col -= 1;
            while (true) {
              for (var c2 = 0; c2 < 2; c2 += 1) {
                if (_modules[row][col - c2] == null) {
                  var dark = false;
                  if (byteIndex < data.length) {
                    dark = (data[byteIndex] >>> bitIndex & 1) == 1;
                  }
                  var mask = maskFunc(row, col - c2);
                  if (mask) {
                    dark = !dark;
                  }
                  _modules[row][col - c2] = dark;
                  bitIndex -= 1;
                  if (bitIndex == -1) {
                    byteIndex += 1;
                    bitIndex = 7;
                  }
                }
              }
              row += inc;
              if (row < 0 || _moduleCount <= row) {
                row -= inc;
                inc = -inc;
                break;
              }
            }
          }
        };
        var createBytes = function(buffer, rsBlocks) {
          var offset = 0;
          var maxDcCount = 0;
          var maxEcCount = 0;
          var dcdata = new Array(rsBlocks.length);
          var ecdata = new Array(rsBlocks.length);
          for (var r = 0; r < rsBlocks.length; r += 1) {
            var dcCount = rsBlocks[r].dataCount;
            var ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (var i2 = 0; i2 < dcdata[r].length; i2 += 1) {
              dcdata[r][i2] = 255 & buffer.getBuffer()[i2 + offset];
            }
            offset += dcCount;
            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);
            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i2 = 0; i2 < ecdata[r].length; i2 += 1) {
              var modIndex = i2 + modPoly.getLength() - ecdata[r].length;
              ecdata[r][i2] = modIndex >= 0 ? modPoly.getAt(modIndex) : 0;
            }
          }
          var totalCodeCount = 0;
          for (var i2 = 0; i2 < rsBlocks.length; i2 += 1) {
            totalCodeCount += rsBlocks[i2].totalCount;
          }
          var data = new Array(totalCodeCount);
          var index = 0;
          for (var i2 = 0; i2 < maxDcCount; i2 += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i2 < dcdata[r].length) {
                data[index] = dcdata[r][i2];
                index += 1;
              }
            }
          }
          for (var i2 = 0; i2 < maxEcCount; i2 += 1) {
            for (var r = 0; r < rsBlocks.length; r += 1) {
              if (i2 < ecdata[r].length) {
                data[index] = ecdata[r][i2];
                index += 1;
              }
            }
          }
          return data;
        };
        var createData = function(typeNumber2, errorCorrectionLevel2, dataList) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, errorCorrectionLevel2);
          var buffer = qrBitBuffer();
          for (var i2 = 0; i2 < dataList.length; i2 += 1) {
            var data = dataList[i2];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
            data.write(buffer);
          }
          var totalDataCount = 0;
          for (var i2 = 0; i2 < rsBlocks.length; i2 += 1) {
            totalDataCount += rsBlocks[i2].dataCount;
          }
          if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw "code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")";
          }
          if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
          }
          while (buffer.getLengthInBits() % 8 != 0) {
            buffer.putBit(false);
          }
          while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
              break;
            }
            buffer.put(PAD1, 8);
          }
          return createBytes(buffer, rsBlocks);
        };
        _this.addData = function(data, mode) {
          mode = mode || "Byte";
          var newData = null;
          switch (mode) {
            case "Numeric":
              newData = qrNumber(data);
              break;
            case "Alphanumeric":
              newData = qrAlphaNum(data);
              break;
            case "Byte":
              newData = qr8BitByte(data);
              break;
            case "Kanji":
              newData = qrKanji(data);
              break;
            default:
              throw "mode:" + mode;
          }
          _dataList.push(newData);
          _dataCache = null;
        };
        _this.isDark = function(row, col) {
          if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
            throw row + "," + col;
          }
          return _modules[row][col];
        };
        _this.getModuleCount = function() {
          return _moduleCount;
        };
        _this.make = function() {
          if (_typeNumber < 1) {
            var typeNumber2 = 1;
            for (; typeNumber2 < 40; typeNumber2++) {
              var rsBlocks = QRRSBlock.getRSBlocks(typeNumber2, _errorCorrectionLevel);
              var buffer = qrBitBuffer();
              for (var i2 = 0; i2 < _dataList.length; i2++) {
                var data = _dataList[i2];
                buffer.put(data.getMode(), 4);
                buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber2));
                data.write(buffer);
              }
              var totalDataCount = 0;
              for (var i2 = 0; i2 < rsBlocks.length; i2++) {
                totalDataCount += rsBlocks[i2].dataCount;
              }
              if (buffer.getLengthInBits() <= totalDataCount * 8) {
                break;
              }
            }
            _typeNumber = typeNumber2;
          }
          makeImpl(false, getBestMaskPattern());
        };
        _this.createTableTag = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var qrHtml = "";
          qrHtml += '<table style="';
          qrHtml += " border-width: 0px; border-style: none;";
          qrHtml += " border-collapse: collapse;";
          qrHtml += " padding: 0px; margin: " + margin + "px;";
          qrHtml += '">';
          qrHtml += "<tbody>";
          for (var r = 0; r < _this.getModuleCount(); r += 1) {
            qrHtml += "<tr>";
            for (var c2 = 0; c2 < _this.getModuleCount(); c2 += 1) {
              qrHtml += '<td style="';
              qrHtml += " border-width: 0px; border-style: none;";
              qrHtml += " border-collapse: collapse;";
              qrHtml += " padding: 0px; margin: 0px;";
              qrHtml += " width: " + cellSize + "px;";
              qrHtml += " height: " + cellSize + "px;";
              qrHtml += " background-color: ";
              qrHtml += _this.isDark(r, c2) ? "#000000" : "#ffffff";
              qrHtml += ";";
              qrHtml += '"/>';
            }
            qrHtml += "</tr>";
          }
          qrHtml += "</tbody>";
          qrHtml += "</table>";
          return qrHtml;
        };
        _this.createSvgTag = function(cellSize, margin, alt, title) {
          var opts = {};
          if (typeof arguments[0] == "object") {
            opts = arguments[0];
            cellSize = opts.cellSize;
            margin = opts.margin;
            alt = opts.alt;
            title = opts.title;
          }
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          alt = typeof alt === "string" ? { text: alt } : alt || {};
          alt.text = alt.text || null;
          alt.id = alt.text ? alt.id || "qrcode-description" : null;
          title = typeof title === "string" ? { text: title } : title || {};
          title.text = title.text || null;
          title.id = title.text ? title.id || "qrcode-title" : null;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var c2, mc, r, mr, qrSvg = "", rect;
          rect = "l" + cellSize + ",0 0," + cellSize + " -" + cellSize + ",0 0,-" + cellSize + "z ";
          qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
          qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : "";
          qrSvg += ' viewBox="0 0 ' + size + " " + size + '" ';
          qrSvg += ' preserveAspectRatio="xMinYMin meet"';
          qrSvg += title.text || alt.text ? ' role="img" aria-labelledby="' + escapeXml([title.id, alt.id].join(" ").trim()) + '"' : "";
          qrSvg += ">";
          qrSvg += title.text ? '<title id="' + escapeXml(title.id) + '">' + escapeXml(title.text) + "</title>" : "";
          qrSvg += alt.text ? '<description id="' + escapeXml(alt.id) + '">' + escapeXml(alt.text) + "</description>" : "";
          qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
          qrSvg += '<path d="';
          for (r = 0; r < _this.getModuleCount(); r += 1) {
            mr = r * cellSize + margin;
            for (c2 = 0; c2 < _this.getModuleCount(); c2 += 1) {
              if (_this.isDark(r, c2)) {
                mc = c2 * cellSize + margin;
                qrSvg += "M" + mc + "," + mr + rect;
              }
            }
          }
          qrSvg += '" stroke="transparent" fill="black"/>';
          qrSvg += "</svg>";
          return qrSvg;
        };
        _this.createDataURL = function(cellSize, margin) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min2 = margin;
          var max2 = size - margin;
          return createDataURL(size, size, function(x, y) {
            if (min2 <= x && x < max2 && min2 <= y && y < max2) {
              var c2 = Math.floor((x - min2) / cellSize);
              var r = Math.floor((y - min2) / cellSize);
              return _this.isDark(r, c2) ? 0 : 1;
            } else {
              return 1;
            }
          });
        };
        _this.createImgTag = function(cellSize, margin, alt) {
          cellSize = cellSize || 2;
          margin = typeof margin == "undefined" ? cellSize * 4 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var img = "";
          img += "<img";
          img += ' src="';
          img += _this.createDataURL(cellSize, margin);
          img += '"';
          img += ' width="';
          img += size;
          img += '"';
          img += ' height="';
          img += size;
          img += '"';
          if (alt) {
            img += ' alt="';
            img += escapeXml(alt);
            img += '"';
          }
          img += "/>";
          return img;
        };
        var escapeXml = function(s2) {
          var escaped = "";
          for (var i2 = 0; i2 < s2.length; i2 += 1) {
            var c2 = s2.charAt(i2);
            switch (c2) {
              case "<":
                escaped += "&lt;";
                break;
              case ">":
                escaped += "&gt;";
                break;
              case "&":
                escaped += "&amp;";
                break;
              case '"':
                escaped += "&quot;";
                break;
              default:
                escaped += c2;
                break;
            }
          }
          return escaped;
        };
        var _createHalfASCII = function(margin) {
          var cellSize = 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min2 = margin;
          var max2 = size - margin;
          var y, x, r1, r2, p2;
          var blocks = {
            "\u2588\u2588": "\u2588",
            "\u2588 ": "\u2580",
            " \u2588": "\u2584",
            "  ": " "
          };
          var blocksLastLineNoMargin = {
            "\u2588\u2588": "\u2580",
            "\u2588 ": "\u2580",
            " \u2588": " ",
            "  ": " "
          };
          var ascii = "";
          for (y = 0; y < size; y += 2) {
            r1 = Math.floor((y - min2) / cellSize);
            r2 = Math.floor((y + 1 - min2) / cellSize);
            for (x = 0; x < size; x += 1) {
              p2 = "\u2588";
              if (min2 <= x && x < max2 && min2 <= y && y < max2 && _this.isDark(r1, Math.floor((x - min2) / cellSize))) {
                p2 = " ";
              }
              if (min2 <= x && x < max2 && min2 <= y + 1 && y + 1 < max2 && _this.isDark(r2, Math.floor((x - min2) / cellSize))) {
                p2 += " ";
              } else {
                p2 += "\u2588";
              }
              ascii += margin < 1 && y + 1 >= max2 ? blocksLastLineNoMargin[p2] : blocks[p2];
            }
            ascii += "\n";
          }
          if (size % 2 && margin > 0) {
            return ascii.substring(0, ascii.length - size - 1) + Array(size + 1).join("\u2580");
          }
          return ascii.substring(0, ascii.length - 1);
        };
        _this.createASCII = function(cellSize, margin) {
          cellSize = cellSize || 1;
          if (cellSize < 2) {
            return _createHalfASCII(margin);
          }
          cellSize -= 1;
          margin = typeof margin == "undefined" ? cellSize * 2 : margin;
          var size = _this.getModuleCount() * cellSize + margin * 2;
          var min2 = margin;
          var max2 = size - margin;
          var y, x, r, p2;
          var white = Array(cellSize + 1).join("\u2588\u2588");
          var black = Array(cellSize + 1).join("  ");
          var ascii = "";
          var line = "";
          for (y = 0; y < size; y += 1) {
            r = Math.floor((y - min2) / cellSize);
            line = "";
            for (x = 0; x < size; x += 1) {
              p2 = 1;
              if (min2 <= x && x < max2 && min2 <= y && y < max2 && _this.isDark(r, Math.floor((x - min2) / cellSize))) {
                p2 = 0;
              }
              line += p2 ? white : black;
            }
            for (r = 0; r < cellSize; r += 1) {
              ascii += line + "\n";
            }
          }
          return ascii.substring(0, ascii.length - 1);
        };
        _this.renderTo2dContext = function(context, cellSize) {
          cellSize = cellSize || 2;
          var length = _this.getModuleCount();
          for (var row = 0; row < length; row++) {
            for (var col = 0; col < length; col++) {
              context.fillStyle = _this.isDark(row, col) ? "black" : "white";
              context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
            }
          }
        };
        return _this;
      };
      qrcode3.stringToBytesFuncs = {
        "default": function(s2) {
          var bytes = [];
          for (var i2 = 0; i2 < s2.length; i2 += 1) {
            var c2 = s2.charCodeAt(i2);
            bytes.push(c2 & 255);
          }
          return bytes;
        }
      };
      qrcode3.stringToBytes = qrcode3.stringToBytesFuncs["default"];
      qrcode3.createStringToBytes = function(unicodeData, numChars) {
        var unicodeMap = function() {
          var bin = base64DecodeInputStream(unicodeData);
          var read = function() {
            var b = bin.read();
            if (b == -1)
              throw "eof";
            return b;
          };
          var count = 0;
          var unicodeMap2 = {};
          while (true) {
            var b0 = bin.read();
            if (b0 == -1)
              break;
            var b1 = read();
            var b2 = read();
            var b3 = read();
            var k = String.fromCharCode(b0 << 8 | b1);
            var v = b2 << 8 | b3;
            unicodeMap2[k] = v;
            count += 1;
          }
          if (count != numChars) {
            throw count + " != " + numChars;
          }
          return unicodeMap2;
        }();
        var unknownChar = "?".charCodeAt(0);
        return function(s2) {
          var bytes = [];
          for (var i2 = 0; i2 < s2.length; i2 += 1) {
            var c2 = s2.charCodeAt(i2);
            if (c2 < 128) {
              bytes.push(c2);
            } else {
              var b = unicodeMap[s2.charAt(i2)];
              if (typeof b == "number") {
                if ((b & 255) == b) {
                  bytes.push(b);
                } else {
                  bytes.push(b >>> 8);
                  bytes.push(b & 255);
                }
              } else {
                bytes.push(unknownChar);
              }
            }
          }
          return bytes;
        };
      };
      var QRMode = {
        MODE_NUMBER: 1 << 0,
        MODE_ALPHA_NUM: 1 << 1,
        MODE_8BIT_BYTE: 1 << 2,
        MODE_KANJI: 1 << 3
      };
      var QRErrorCorrectionLevel = {
        L: 1,
        M: 0,
        Q: 3,
        H: 2
      };
      var QRMaskPattern = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      };
      var QRUtil = function() {
        var PATTERN_POSITION_TABLE = [
          [],
          [6, 18],
          [6, 22],
          [6, 26],
          [6, 30],
          [6, 34],
          [6, 22, 38],
          [6, 24, 42],
          [6, 26, 46],
          [6, 28, 50],
          [6, 30, 54],
          [6, 32, 58],
          [6, 34, 62],
          [6, 26, 46, 66],
          [6, 26, 48, 70],
          [6, 26, 50, 74],
          [6, 30, 54, 78],
          [6, 30, 56, 82],
          [6, 30, 58, 86],
          [6, 34, 62, 90],
          [6, 28, 50, 72, 94],
          [6, 26, 50, 74, 98],
          [6, 30, 54, 78, 102],
          [6, 28, 54, 80, 106],
          [6, 32, 58, 84, 110],
          [6, 30, 58, 86, 114],
          [6, 34, 62, 90, 118],
          [6, 26, 50, 74, 98, 122],
          [6, 30, 54, 78, 102, 126],
          [6, 26, 52, 78, 104, 130],
          [6, 30, 56, 82, 108, 134],
          [6, 34, 60, 86, 112, 138],
          [6, 30, 58, 86, 114, 142],
          [6, 34, 62, 90, 118, 146],
          [6, 30, 54, 78, 102, 126, 150],
          [6, 24, 50, 76, 102, 128, 154],
          [6, 28, 54, 80, 106, 132, 158],
          [6, 32, 58, 84, 110, 136, 162],
          [6, 26, 54, 82, 110, 138, 166],
          [6, 30, 58, 86, 114, 142, 170]
        ];
        var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
        var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
        var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
        var _this = {};
        var getBCHDigit = function(data) {
          var digit = 0;
          while (data != 0) {
            digit += 1;
            data >>>= 1;
          }
          return digit;
        };
        _this.getBCHTypeInfo = function(data) {
          var d = data << 10;
          while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
            d ^= G15 << getBCHDigit(d) - getBCHDigit(G15);
          }
          return (data << 10 | d) ^ G15_MASK;
        };
        _this.getBCHTypeNumber = function(data) {
          var d = data << 12;
          while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
            d ^= G18 << getBCHDigit(d) - getBCHDigit(G18);
          }
          return data << 12 | d;
        };
        _this.getPatternPosition = function(typeNumber) {
          return PATTERN_POSITION_TABLE[typeNumber - 1];
        };
        _this.getMaskFunction = function(maskPattern) {
          switch (maskPattern) {
            case QRMaskPattern.PATTERN000:
              return function(i2, j) {
                return (i2 + j) % 2 == 0;
              };
            case QRMaskPattern.PATTERN001:
              return function(i2, j) {
                return i2 % 2 == 0;
              };
            case QRMaskPattern.PATTERN010:
              return function(i2, j) {
                return j % 3 == 0;
              };
            case QRMaskPattern.PATTERN011:
              return function(i2, j) {
                return (i2 + j) % 3 == 0;
              };
            case QRMaskPattern.PATTERN100:
              return function(i2, j) {
                return (Math.floor(i2 / 2) + Math.floor(j / 3)) % 2 == 0;
              };
            case QRMaskPattern.PATTERN101:
              return function(i2, j) {
                return i2 * j % 2 + i2 * j % 3 == 0;
              };
            case QRMaskPattern.PATTERN110:
              return function(i2, j) {
                return (i2 * j % 2 + i2 * j % 3) % 2 == 0;
              };
            case QRMaskPattern.PATTERN111:
              return function(i2, j) {
                return (i2 * j % 3 + (i2 + j) % 2) % 2 == 0;
              };
            default:
              throw "bad maskPattern:" + maskPattern;
          }
        };
        _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
          var a2 = qrPolynomial([1], 0);
          for (var i2 = 0; i2 < errorCorrectLength; i2 += 1) {
            a2 = a2.multiply(qrPolynomial([1, QRMath.gexp(i2)], 0));
          }
          return a2;
        };
        _this.getLengthInBits = function(mode, type) {
          if (1 <= type && type < 10) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 10;
              case QRMode.MODE_ALPHA_NUM:
                return 9;
              case QRMode.MODE_8BIT_BYTE:
                return 8;
              case QRMode.MODE_KANJI:
                return 8;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 27) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 12;
              case QRMode.MODE_ALPHA_NUM:
                return 11;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 10;
              default:
                throw "mode:" + mode;
            }
          } else if (type < 41) {
            switch (mode) {
              case QRMode.MODE_NUMBER:
                return 14;
              case QRMode.MODE_ALPHA_NUM:
                return 13;
              case QRMode.MODE_8BIT_BYTE:
                return 16;
              case QRMode.MODE_KANJI:
                return 12;
              default:
                throw "mode:" + mode;
            }
          } else {
            throw "type:" + type;
          }
        };
        _this.getLostPoint = function(qrcode4) {
          var moduleCount = qrcode4.getModuleCount();
          var lostPoint = 0;
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount; col += 1) {
              var sameCount = 0;
              var dark = qrcode4.isDark(row, col);
              for (var r = -1; r <= 1; r += 1) {
                if (row + r < 0 || moduleCount <= row + r) {
                  continue;
                }
                for (var c2 = -1; c2 <= 1; c2 += 1) {
                  if (col + c2 < 0 || moduleCount <= col + c2) {
                    continue;
                  }
                  if (r == 0 && c2 == 0) {
                    continue;
                  }
                  if (dark == qrcode4.isDark(row + r, col + c2)) {
                    sameCount += 1;
                  }
                }
              }
              if (sameCount > 5) {
                lostPoint += 3 + sameCount - 5;
              }
            }
          }
          for (var row = 0; row < moduleCount - 1; row += 1) {
            for (var col = 0; col < moduleCount - 1; col += 1) {
              var count = 0;
              if (qrcode4.isDark(row, col))
                count += 1;
              if (qrcode4.isDark(row + 1, col))
                count += 1;
              if (qrcode4.isDark(row, col + 1))
                count += 1;
              if (qrcode4.isDark(row + 1, col + 1))
                count += 1;
              if (count == 0 || count == 4) {
                lostPoint += 3;
              }
            }
          }
          for (var row = 0; row < moduleCount; row += 1) {
            for (var col = 0; col < moduleCount - 6; col += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row, col + 1) && qrcode4.isDark(row, col + 2) && qrcode4.isDark(row, col + 3) && qrcode4.isDark(row, col + 4) && !qrcode4.isDark(row, col + 5) && qrcode4.isDark(row, col + 6)) {
                lostPoint += 40;
              }
            }
          }
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount - 6; row += 1) {
              if (qrcode4.isDark(row, col) && !qrcode4.isDark(row + 1, col) && qrcode4.isDark(row + 2, col) && qrcode4.isDark(row + 3, col) && qrcode4.isDark(row + 4, col) && !qrcode4.isDark(row + 5, col) && qrcode4.isDark(row + 6, col)) {
                lostPoint += 40;
              }
            }
          }
          var darkCount = 0;
          for (var col = 0; col < moduleCount; col += 1) {
            for (var row = 0; row < moduleCount; row += 1) {
              if (qrcode4.isDark(row, col)) {
                darkCount += 1;
              }
            }
          }
          var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
          lostPoint += ratio * 10;
          return lostPoint;
        };
        return _this;
      }();
      var QRMath = function() {
        var EXP_TABLE = new Array(256);
        var LOG_TABLE = new Array(256);
        for (var i2 = 0; i2 < 8; i2 += 1) {
          EXP_TABLE[i2] = 1 << i2;
        }
        for (var i2 = 8; i2 < 256; i2 += 1) {
          EXP_TABLE[i2] = EXP_TABLE[i2 - 4] ^ EXP_TABLE[i2 - 5] ^ EXP_TABLE[i2 - 6] ^ EXP_TABLE[i2 - 8];
        }
        for (var i2 = 0; i2 < 255; i2 += 1) {
          LOG_TABLE[EXP_TABLE[i2]] = i2;
        }
        var _this = {};
        _this.glog = function(n2) {
          if (n2 < 1) {
            throw "glog(" + n2 + ")";
          }
          return LOG_TABLE[n2];
        };
        _this.gexp = function(n2) {
          while (n2 < 0) {
            n2 += 255;
          }
          while (n2 >= 256) {
            n2 -= 255;
          }
          return EXP_TABLE[n2];
        };
        return _this;
      }();
      function qrPolynomial(num, shift) {
        if (typeof num.length == "undefined") {
          throw num.length + "/" + shift;
        }
        var _num = function() {
          var offset = 0;
          while (offset < num.length && num[offset] == 0) {
            offset += 1;
          }
          var _num2 = new Array(num.length - offset + shift);
          for (var i2 = 0; i2 < num.length - offset; i2 += 1) {
            _num2[i2] = num[i2 + offset];
          }
          return _num2;
        }();
        var _this = {};
        _this.getAt = function(index) {
          return _num[index];
        };
        _this.getLength = function() {
          return _num.length;
        };
        _this.multiply = function(e2) {
          var num2 = new Array(_this.getLength() + e2.getLength() - 1);
          for (var i2 = 0; i2 < _this.getLength(); i2 += 1) {
            for (var j = 0; j < e2.getLength(); j += 1) {
              num2[i2 + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i2)) + QRMath.glog(e2.getAt(j)));
            }
          }
          return qrPolynomial(num2, 0);
        };
        _this.mod = function(e2) {
          if (_this.getLength() - e2.getLength() < 0) {
            return _this;
          }
          var ratio = QRMath.glog(_this.getAt(0)) - QRMath.glog(e2.getAt(0));
          var num2 = new Array(_this.getLength());
          for (var i2 = 0; i2 < _this.getLength(); i2 += 1) {
            num2[i2] = _this.getAt(i2);
          }
          for (var i2 = 0; i2 < e2.getLength(); i2 += 1) {
            num2[i2] ^= QRMath.gexp(QRMath.glog(e2.getAt(i2)) + ratio);
          }
          return qrPolynomial(num2, 0).mod(e2);
        };
        return _this;
      }
      var QRRSBlock = function() {
        var RS_BLOCK_TABLE = [
          [1, 26, 19],
          [1, 26, 16],
          [1, 26, 13],
          [1, 26, 9],
          [1, 44, 34],
          [1, 44, 28],
          [1, 44, 22],
          [1, 44, 16],
          [1, 70, 55],
          [1, 70, 44],
          [2, 35, 17],
          [2, 35, 13],
          [1, 100, 80],
          [2, 50, 32],
          [2, 50, 24],
          [4, 25, 9],
          [1, 134, 108],
          [2, 67, 43],
          [2, 33, 15, 2, 34, 16],
          [2, 33, 11, 2, 34, 12],
          [2, 86, 68],
          [4, 43, 27],
          [4, 43, 19],
          [4, 43, 15],
          [2, 98, 78],
          [4, 49, 31],
          [2, 32, 14, 4, 33, 15],
          [4, 39, 13, 1, 40, 14],
          [2, 121, 97],
          [2, 60, 38, 2, 61, 39],
          [4, 40, 18, 2, 41, 19],
          [4, 40, 14, 2, 41, 15],
          [2, 146, 116],
          [3, 58, 36, 2, 59, 37],
          [4, 36, 16, 4, 37, 17],
          [4, 36, 12, 4, 37, 13],
          [2, 86, 68, 2, 87, 69],
          [4, 69, 43, 1, 70, 44],
          [6, 43, 19, 2, 44, 20],
          [6, 43, 15, 2, 44, 16],
          [4, 101, 81],
          [1, 80, 50, 4, 81, 51],
          [4, 50, 22, 4, 51, 23],
          [3, 36, 12, 8, 37, 13],
          [2, 116, 92, 2, 117, 93],
          [6, 58, 36, 2, 59, 37],
          [4, 46, 20, 6, 47, 21],
          [7, 42, 14, 4, 43, 15],
          [4, 133, 107],
          [8, 59, 37, 1, 60, 38],
          [8, 44, 20, 4, 45, 21],
          [12, 33, 11, 4, 34, 12],
          [3, 145, 115, 1, 146, 116],
          [4, 64, 40, 5, 65, 41],
          [11, 36, 16, 5, 37, 17],
          [11, 36, 12, 5, 37, 13],
          [5, 109, 87, 1, 110, 88],
          [5, 65, 41, 5, 66, 42],
          [5, 54, 24, 7, 55, 25],
          [11, 36, 12, 7, 37, 13],
          [5, 122, 98, 1, 123, 99],
          [7, 73, 45, 3, 74, 46],
          [15, 43, 19, 2, 44, 20],
          [3, 45, 15, 13, 46, 16],
          [1, 135, 107, 5, 136, 108],
          [10, 74, 46, 1, 75, 47],
          [1, 50, 22, 15, 51, 23],
          [2, 42, 14, 17, 43, 15],
          [5, 150, 120, 1, 151, 121],
          [9, 69, 43, 4, 70, 44],
          [17, 50, 22, 1, 51, 23],
          [2, 42, 14, 19, 43, 15],
          [3, 141, 113, 4, 142, 114],
          [3, 70, 44, 11, 71, 45],
          [17, 47, 21, 4, 48, 22],
          [9, 39, 13, 16, 40, 14],
          [3, 135, 107, 5, 136, 108],
          [3, 67, 41, 13, 68, 42],
          [15, 54, 24, 5, 55, 25],
          [15, 43, 15, 10, 44, 16],
          [4, 144, 116, 4, 145, 117],
          [17, 68, 42],
          [17, 50, 22, 6, 51, 23],
          [19, 46, 16, 6, 47, 17],
          [2, 139, 111, 7, 140, 112],
          [17, 74, 46],
          [7, 54, 24, 16, 55, 25],
          [34, 37, 13],
          [4, 151, 121, 5, 152, 122],
          [4, 75, 47, 14, 76, 48],
          [11, 54, 24, 14, 55, 25],
          [16, 45, 15, 14, 46, 16],
          [6, 147, 117, 4, 148, 118],
          [6, 73, 45, 14, 74, 46],
          [11, 54, 24, 16, 55, 25],
          [30, 46, 16, 2, 47, 17],
          [8, 132, 106, 4, 133, 107],
          [8, 75, 47, 13, 76, 48],
          [7, 54, 24, 22, 55, 25],
          [22, 45, 15, 13, 46, 16],
          [10, 142, 114, 2, 143, 115],
          [19, 74, 46, 4, 75, 47],
          [28, 50, 22, 6, 51, 23],
          [33, 46, 16, 4, 47, 17],
          [8, 152, 122, 4, 153, 123],
          [22, 73, 45, 3, 74, 46],
          [8, 53, 23, 26, 54, 24],
          [12, 45, 15, 28, 46, 16],
          [3, 147, 117, 10, 148, 118],
          [3, 73, 45, 23, 74, 46],
          [4, 54, 24, 31, 55, 25],
          [11, 45, 15, 31, 46, 16],
          [7, 146, 116, 7, 147, 117],
          [21, 73, 45, 7, 74, 46],
          [1, 53, 23, 37, 54, 24],
          [19, 45, 15, 26, 46, 16],
          [5, 145, 115, 10, 146, 116],
          [19, 75, 47, 10, 76, 48],
          [15, 54, 24, 25, 55, 25],
          [23, 45, 15, 25, 46, 16],
          [13, 145, 115, 3, 146, 116],
          [2, 74, 46, 29, 75, 47],
          [42, 54, 24, 1, 55, 25],
          [23, 45, 15, 28, 46, 16],
          [17, 145, 115],
          [10, 74, 46, 23, 75, 47],
          [10, 54, 24, 35, 55, 25],
          [19, 45, 15, 35, 46, 16],
          [17, 145, 115, 1, 146, 116],
          [14, 74, 46, 21, 75, 47],
          [29, 54, 24, 19, 55, 25],
          [11, 45, 15, 46, 46, 16],
          [13, 145, 115, 6, 146, 116],
          [14, 74, 46, 23, 75, 47],
          [44, 54, 24, 7, 55, 25],
          [59, 46, 16, 1, 47, 17],
          [12, 151, 121, 7, 152, 122],
          [12, 75, 47, 26, 76, 48],
          [39, 54, 24, 14, 55, 25],
          [22, 45, 15, 41, 46, 16],
          [6, 151, 121, 14, 152, 122],
          [6, 75, 47, 34, 76, 48],
          [46, 54, 24, 10, 55, 25],
          [2, 45, 15, 64, 46, 16],
          [17, 152, 122, 4, 153, 123],
          [29, 74, 46, 14, 75, 47],
          [49, 54, 24, 10, 55, 25],
          [24, 45, 15, 46, 46, 16],
          [4, 152, 122, 18, 153, 123],
          [13, 74, 46, 32, 75, 47],
          [48, 54, 24, 14, 55, 25],
          [42, 45, 15, 32, 46, 16],
          [20, 147, 117, 4, 148, 118],
          [40, 75, 47, 7, 76, 48],
          [43, 54, 24, 22, 55, 25],
          [10, 45, 15, 67, 46, 16],
          [19, 148, 118, 6, 149, 119],
          [18, 75, 47, 31, 76, 48],
          [34, 54, 24, 34, 55, 25],
          [20, 45, 15, 61, 46, 16]
        ];
        var qrRSBlock = function(totalCount, dataCount) {
          var _this2 = {};
          _this2.totalCount = totalCount;
          _this2.dataCount = dataCount;
          return _this2;
        };
        var _this = {};
        var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {
          switch (errorCorrectionLevel) {
            case QRErrorCorrectionLevel.L:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case QRErrorCorrectionLevel.M:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case QRErrorCorrectionLevel.Q:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case QRErrorCorrectionLevel.H:
              return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
              return void 0;
          }
        };
        _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {
          var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);
          if (typeof rsBlock == "undefined") {
            throw "bad rs block @ typeNumber:" + typeNumber + "/errorCorrectionLevel:" + errorCorrectionLevel;
          }
          var length = rsBlock.length / 3;
          var list = [];
          for (var i2 = 0; i2 < length; i2 += 1) {
            var count = rsBlock[i2 * 3 + 0];
            var totalCount = rsBlock[i2 * 3 + 1];
            var dataCount = rsBlock[i2 * 3 + 2];
            for (var j = 0; j < count; j += 1) {
              list.push(qrRSBlock(totalCount, dataCount));
            }
          }
          return list;
        };
        return _this;
      }();
      var qrBitBuffer = function() {
        var _buffer = [];
        var _length = 0;
        var _this = {};
        _this.getBuffer = function() {
          return _buffer;
        };
        _this.getAt = function(index) {
          var bufIndex = Math.floor(index / 8);
          return (_buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
        };
        _this.put = function(num, length) {
          for (var i2 = 0; i2 < length; i2 += 1) {
            _this.putBit((num >>> length - i2 - 1 & 1) == 1);
          }
        };
        _this.getLengthInBits = function() {
          return _length;
        };
        _this.putBit = function(bit) {
          var bufIndex = Math.floor(_length / 8);
          if (_buffer.length <= bufIndex) {
            _buffer.push(0);
          }
          if (bit) {
            _buffer[bufIndex] |= 128 >>> _length % 8;
          }
          _length += 1;
        };
        return _this;
      };
      var qrNumber = function(data) {
        var _mode = QRMode.MODE_NUMBER;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var data2 = _data;
          var i2 = 0;
          while (i2 + 2 < data2.length) {
            buffer.put(strToNum(data2.substring(i2, i2 + 3)), 10);
            i2 += 3;
          }
          if (i2 < data2.length) {
            if (data2.length - i2 == 1) {
              buffer.put(strToNum(data2.substring(i2, i2 + 1)), 4);
            } else if (data2.length - i2 == 2) {
              buffer.put(strToNum(data2.substring(i2, i2 + 2)), 7);
            }
          }
        };
        var strToNum = function(s2) {
          var num = 0;
          for (var i2 = 0; i2 < s2.length; i2 += 1) {
            num = num * 10 + chatToNum(s2.charAt(i2));
          }
          return num;
        };
        var chatToNum = function(c2) {
          if ("0" <= c2 && c2 <= "9") {
            return c2.charCodeAt(0) - "0".charCodeAt(0);
          }
          throw "illegal char :" + c2;
        };
        return _this;
      };
      var qrAlphaNum = function(data) {
        var _mode = QRMode.MODE_ALPHA_NUM;
        var _data = data;
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _data.length;
        };
        _this.write = function(buffer) {
          var s2 = _data;
          var i2 = 0;
          while (i2 + 1 < s2.length) {
            buffer.put(
              getCode(s2.charAt(i2)) * 45 + getCode(s2.charAt(i2 + 1)),
              11
            );
            i2 += 2;
          }
          if (i2 < s2.length) {
            buffer.put(getCode(s2.charAt(i2)), 6);
          }
        };
        var getCode = function(c2) {
          if ("0" <= c2 && c2 <= "9") {
            return c2.charCodeAt(0) - "0".charCodeAt(0);
          } else if ("A" <= c2 && c2 <= "Z") {
            return c2.charCodeAt(0) - "A".charCodeAt(0) + 10;
          } else {
            switch (c2) {
              case " ":
                return 36;
              case "$":
                return 37;
              case "%":
                return 38;
              case "*":
                return 39;
              case "+":
                return 40;
              case "-":
                return 41;
              case ".":
                return 42;
              case "/":
                return 43;
              case ":":
                return 44;
              default:
                throw "illegal char :" + c2;
            }
          }
        };
        return _this;
      };
      var qr8BitByte = function(data) {
        var _mode = QRMode.MODE_8BIT_BYTE;
        var _bytes = qrcode3.stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return _bytes.length;
        };
        _this.write = function(buffer) {
          for (var i2 = 0; i2 < _bytes.length; i2 += 1) {
            buffer.put(_bytes[i2], 8);
          }
        };
        return _this;
      };
      var qrKanji = function(data) {
        var _mode = QRMode.MODE_KANJI;
        var stringToBytes = qrcode3.stringToBytesFuncs["SJIS"];
        if (!stringToBytes) {
          throw "sjis not supported.";
        }
        !function(c2, code) {
          var test = stringToBytes(c2);
          if (test.length != 2 || (test[0] << 8 | test[1]) != code) {
            throw "sjis not supported.";
          }
        }("\u53CB", 38726);
        var _bytes = stringToBytes(data);
        var _this = {};
        _this.getMode = function() {
          return _mode;
        };
        _this.getLength = function(buffer) {
          return ~~(_bytes.length / 2);
        };
        _this.write = function(buffer) {
          var data2 = _bytes;
          var i2 = 0;
          while (i2 + 1 < data2.length) {
            var c2 = (255 & data2[i2]) << 8 | 255 & data2[i2 + 1];
            if (33088 <= c2 && c2 <= 40956) {
              c2 -= 33088;
            } else if (57408 <= c2 && c2 <= 60351) {
              c2 -= 49472;
            } else {
              throw "illegal char at " + (i2 + 1) + "/" + c2;
            }
            c2 = (c2 >>> 8 & 255) * 192 + (c2 & 255);
            buffer.put(c2, 13);
            i2 += 2;
          }
          if (i2 < data2.length) {
            throw "illegal char at " + (i2 + 1);
          }
        };
        return _this;
      };
      var byteArrayOutputStream = function() {
        var _bytes = [];
        var _this = {};
        _this.writeByte = function(b) {
          _bytes.push(b & 255);
        };
        _this.writeShort = function(i2) {
          _this.writeByte(i2);
          _this.writeByte(i2 >>> 8);
        };
        _this.writeBytes = function(b, off, len) {
          off = off || 0;
          len = len || b.length;
          for (var i2 = 0; i2 < len; i2 += 1) {
            _this.writeByte(b[i2 + off]);
          }
        };
        _this.writeString = function(s2) {
          for (var i2 = 0; i2 < s2.length; i2 += 1) {
            _this.writeByte(s2.charCodeAt(i2));
          }
        };
        _this.toByteArray = function() {
          return _bytes;
        };
        _this.toString = function() {
          var s2 = "";
          s2 += "[";
          for (var i2 = 0; i2 < _bytes.length; i2 += 1) {
            if (i2 > 0) {
              s2 += ",";
            }
            s2 += _bytes[i2];
          }
          s2 += "]";
          return s2;
        };
        return _this;
      };
      var base64EncodeOutputStream = function() {
        var _buffer = 0;
        var _buflen = 0;
        var _length = 0;
        var _base64 = "";
        var _this = {};
        var writeEncoded = function(b) {
          _base64 += String.fromCharCode(encode(b & 63));
        };
        var encode = function(n2) {
          if (n2 < 0)
            ;
          else if (n2 < 26) {
            return 65 + n2;
          } else if (n2 < 52) {
            return 97 + (n2 - 26);
          } else if (n2 < 62) {
            return 48 + (n2 - 52);
          } else if (n2 == 62) {
            return 43;
          } else if (n2 == 63) {
            return 47;
          }
          throw "n:" + n2;
        };
        _this.writeByte = function(n2) {
          _buffer = _buffer << 8 | n2 & 255;
          _buflen += 8;
          _length += 1;
          while (_buflen >= 6) {
            writeEncoded(_buffer >>> _buflen - 6);
            _buflen -= 6;
          }
        };
        _this.flush = function() {
          if (_buflen > 0) {
            writeEncoded(_buffer << 6 - _buflen);
            _buffer = 0;
            _buflen = 0;
          }
          if (_length % 3 != 0) {
            var padlen = 3 - _length % 3;
            for (var i2 = 0; i2 < padlen; i2 += 1) {
              _base64 += "=";
            }
          }
        };
        _this.toString = function() {
          return _base64;
        };
        return _this;
      };
      var base64DecodeInputStream = function(str) {
        var _str = str;
        var _pos = 0;
        var _buffer = 0;
        var _buflen = 0;
        var _this = {};
        _this.read = function() {
          while (_buflen < 8) {
            if (_pos >= _str.length) {
              if (_buflen == 0) {
                return -1;
              }
              throw "unexpected end of file./" + _buflen;
            }
            var c2 = _str.charAt(_pos);
            _pos += 1;
            if (c2 == "=") {
              _buflen = 0;
              return -1;
            } else if (c2.match(/^\s$/)) {
              continue;
            }
            _buffer = _buffer << 6 | decode(c2.charCodeAt(0));
            _buflen += 6;
          }
          var n2 = _buffer >>> _buflen - 8 & 255;
          _buflen -= 8;
          return n2;
        };
        var decode = function(c2) {
          if (65 <= c2 && c2 <= 90) {
            return c2 - 65;
          } else if (97 <= c2 && c2 <= 122) {
            return c2 - 97 + 26;
          } else if (48 <= c2 && c2 <= 57) {
            return c2 - 48 + 52;
          } else if (c2 == 43) {
            return 62;
          } else if (c2 == 47) {
            return 63;
          } else {
            throw "c:" + c2;
          }
        };
        return _this;
      };
      var gifImage = function(width, height) {
        var _width = width;
        var _height = height;
        var _data = new Array(width * height);
        var _this = {};
        _this.setPixel = function(x, y, pixel) {
          _data[y * _width + x] = pixel;
        };
        _this.write = function(out) {
          out.writeString("GIF87a");
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(128);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(0);
          out.writeByte(255);
          out.writeByte(255);
          out.writeByte(255);
          out.writeString(",");
          out.writeShort(0);
          out.writeShort(0);
          out.writeShort(_width);
          out.writeShort(_height);
          out.writeByte(0);
          var lzwMinCodeSize = 2;
          var raster = getLZWRaster(lzwMinCodeSize);
          out.writeByte(lzwMinCodeSize);
          var offset = 0;
          while (raster.length - offset > 255) {
            out.writeByte(255);
            out.writeBytes(raster, offset, 255);
            offset += 255;
          }
          out.writeByte(raster.length - offset);
          out.writeBytes(raster, offset, raster.length - offset);
          out.writeByte(0);
          out.writeString(";");
        };
        var bitOutputStream = function(out) {
          var _out = out;
          var _bitLength = 0;
          var _bitBuffer = 0;
          var _this2 = {};
          _this2.write = function(data, length) {
            if (data >>> length != 0) {
              throw "length over";
            }
            while (_bitLength + length >= 8) {
              _out.writeByte(255 & (data << _bitLength | _bitBuffer));
              length -= 8 - _bitLength;
              data >>>= 8 - _bitLength;
              _bitBuffer = 0;
              _bitLength = 0;
            }
            _bitBuffer = data << _bitLength | _bitBuffer;
            _bitLength = _bitLength + length;
          };
          _this2.flush = function() {
            if (_bitLength > 0) {
              _out.writeByte(_bitBuffer);
            }
          };
          return _this2;
        };
        var getLZWRaster = function(lzwMinCodeSize) {
          var clearCode = 1 << lzwMinCodeSize;
          var endCode = (1 << lzwMinCodeSize) + 1;
          var bitLength = lzwMinCodeSize + 1;
          var table = lzwTable();
          for (var i2 = 0; i2 < clearCode; i2 += 1) {
            table.add(String.fromCharCode(i2));
          }
          table.add(String.fromCharCode(clearCode));
          table.add(String.fromCharCode(endCode));
          var byteOut = byteArrayOutputStream();
          var bitOut = bitOutputStream(byteOut);
          bitOut.write(clearCode, bitLength);
          var dataIndex = 0;
          var s2 = String.fromCharCode(_data[dataIndex]);
          dataIndex += 1;
          while (dataIndex < _data.length) {
            var c2 = String.fromCharCode(_data[dataIndex]);
            dataIndex += 1;
            if (table.contains(s2 + c2)) {
              s2 = s2 + c2;
            } else {
              bitOut.write(table.indexOf(s2), bitLength);
              if (table.size() < 4095) {
                if (table.size() == 1 << bitLength) {
                  bitLength += 1;
                }
                table.add(s2 + c2);
              }
              s2 = c2;
            }
          }
          bitOut.write(table.indexOf(s2), bitLength);
          bitOut.write(endCode, bitLength);
          bitOut.flush();
          return byteOut.toByteArray();
        };
        var lzwTable = function() {
          var _map = {};
          var _size = 0;
          var _this2 = {};
          _this2.add = function(key) {
            if (_this2.contains(key)) {
              throw "dup key:" + key;
            }
            _map[key] = _size;
            _size += 1;
          };
          _this2.size = function() {
            return _size;
          };
          _this2.indexOf = function(key) {
            return _map[key];
          };
          _this2.contains = function(key) {
            return typeof _map[key] != "undefined";
          };
          return _this2;
        };
        return _this;
      };
      var createDataURL = function(width, height, getPixel) {
        var gif = gifImage(width, height);
        for (var y = 0; y < height; y += 1) {
          for (var x = 0; x < width; x += 1) {
            gif.setPixel(x, y, getPixel(x, y));
          }
        }
        var b = byteArrayOutputStream();
        gif.write(b);
        var base64 = base64EncodeOutputStream();
        var bytes = b.toByteArray();
        for (var i2 = 0; i2 < bytes.length; i2 += 1) {
          base64.writeByte(bytes[i2]);
        }
        base64.flush();
        return "data:image/gif;base64," + base64;
      };
      return qrcode3;
    }();
    !function() {
      qrcode2.stringToBytesFuncs["UTF-8"] = function(s2) {
        function toUTF8Array(str) {
          var utf8 = [];
          for (var i2 = 0; i2 < str.length; i2++) {
            var charcode = str.charCodeAt(i2);
            if (charcode < 128)
              utf8.push(charcode);
            else if (charcode < 2048) {
              utf8.push(
                192 | charcode >> 6,
                128 | charcode & 63
              );
            } else if (charcode < 55296 || charcode >= 57344) {
              utf8.push(
                224 | charcode >> 12,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            } else {
              i2++;
              charcode = 65536 + ((charcode & 1023) << 10 | str.charCodeAt(i2) & 1023);
              utf8.push(
                240 | charcode >> 18,
                128 | charcode >> 12 & 63,
                128 | charcode >> 6 & 63,
                128 | charcode & 63
              );
            }
          }
          return utf8;
        }
        return toUTF8Array(s2);
      };
    }();
    (function(factory) {
      {
        module2.exports = factory();
      }
    })(function() {
      return qrcode2;
    });
  })(qrcode$1);
  const qrcode = qrcode$1.exports;
  function copyToClipboard(text) {
    if (navigator == null ? void 0 : navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    }
    fallbackCopyTextToClipboard(text);
    return Promise.resolve();
  }
  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(textArea);
    }
  }
  const _tmpl$$s = /* @__PURE__ */ template$1(`<div></div>`);
  const QRCode = (props) => {
    let qrCodeCanvasRef;
    let qrCodeWrapperRef;
    let imageRef;
    const [copyButtonOpened, setCopyButtonOpened] = createSignal(false);
    const [picSize, setPicSize] = createSignal(picSizeDefault);
    createEffect(() => {
      const errorCorrectionLevel = "L";
      const cellSize = 4;
      const qr = qrcode(0, errorCorrectionLevel);
      qr.addData(props.sourceUrl);
      qr.make();
      qrCodeCanvasRef.innerHTML = qr.createSvgTag(cellSize, 0);
      const qrSize = qrCodeCanvasRef.firstElementChild.clientWidth;
      const scale = Math.round(qrNormalSize / qrSize * 1e5) / 1e5;
      if (imageRef) {
        const imgSize = Math.ceil(imgSizeDefault / (scale * cellSize)) * cellSize;
        const imgOffset = toPx(Math.ceil((qrSize - imgSize) / (2 * cellSize)) * cellSize);
        imageRef.style.top = imgOffset;
        imageRef.style.left = imgOffset;
        imageRef.style.height = toPx(imgSize);
        imageRef.style.width = toPx(imgSize);
        setPicSize(Math.round(picSizeDefault / scale));
      }
      qrCodeWrapperRef.style.transform = `scale(${scale})`;
    });
    let timeoutId = null;
    const onCopyClick = () => {
      setCopyButtonOpened(true);
      copyToClipboard(props.sourceUrl);
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => setCopyButtonOpened(false), 1500);
    };
    return createComponent(QrCodeBackground, {
      get ["class"]() {
        return props.class;
      },
      onClick: onCopyClick,
      get children() {
        return [createComponent(QrCodeWrapper$2, {
          ref(r$) {
            const _ref$ = qrCodeWrapperRef;
            typeof _ref$ === "function" ? _ref$(r$) : qrCodeWrapperRef = r$;
          },
          get children() {
            return [(() => {
              const _el$ = _tmpl$$s.cloneNode(true);
              const _ref$2 = qrCodeCanvasRef;
              typeof _ref$2 === "function" ? use(_ref$2, _el$) : qrCodeCanvasRef = _el$;
              return _el$;
            })(), createComponent(Show, {
              get when() {
                return props.imageUrl;
              },
              get children() {
                return createComponent(ImageBackground, {
                  ref(r$) {
                    const _ref$3 = imageRef;
                    typeof _ref$3 === "function" ? _ref$3(r$) : imageRef = r$;
                  },
                  get children() {
                    return createComponent(ImageStyled$3, {
                      get src() {
                        return props.imageUrl;
                      },
                      alt: "",
                      get size() {
                        return picSize();
                      }
                    });
                  }
                });
              }
            })];
          }
        }), createComponent(Transition, {
          onBeforeEnter: (el) => {
            el.animate([{
              opacity: 0,
              transform: "translate(-50%, 44px)"
            }, {
              opacity: 1,
              transform: "translate(-50%, 0)"
            }], {
              duration: 150,
              easing: "ease-out"
            });
          },
          onExit: (el, done) => {
            el.animate([{
              opacity: 1,
              transform: "translate(-50%, 0)"
            }, {
              opacity: 0,
              transform: "translate(-50%, 44px)"
            }], {
              duration: 150,
              easing: "ease-out"
            }).finished.then(() => {
              done();
            });
          },
          get children() {
            return createComponent(Show, {
              get when() {
                return copyButtonOpened() && !props.disableCopy;
              },
              get children() {
                return createComponent(CopiedBoxStyled, {
                  get children() {
                    return [createComponent(SuccessIcon, {
                      size: "xs"
                    }), createComponent(Text, {
                      translationKey: "common.linkCopied",
                      children: "Link Copied"
                    })];
                  }
                });
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return !props.disableCopy;
          },
          get children() {
            return createComponent(CopyIconButton, {
              get children() {
                return createComponent(CopyLightIcon, {});
              }
            });
          }
        })];
      }
    });
  };
  var deepReadObject = (obj, path, defaultValue) => {
    const value = path.trim().split(".").reduce((a2, b) => a2 ? a2[b] : void 0, obj);
    return value !== void 0 ? value : defaultValue;
  };
  var template = (str, params, reg = /{{(.*?)}}/g) => str.replace(reg, (_, key) => deepReadObject(params, key, ""));
  var createI18nContext = (init = {}, lang = navigator.language in init ? navigator.language : Object.keys(init)[0]) => {
    const [locale, setLocale] = createSignal(lang);
    const [dict, setDict] = createStore(init);
    const translate = (key, params, defaultValue) => {
      const val = deepReadObject(dict[locale()], key, defaultValue || "");
      if (typeof val === "function")
        return val(params);
      if (typeof val === "string")
        return template(val, params || {});
      return val;
    };
    const actions = {
      add(lang2, table) {
        setDict(lang2, (t2) => Object.assign(t2 || {}, table));
      },
      locale: (lang2) => lang2 ? setLocale(lang2) : locale(),
      dict: (lang2) => deepReadObject(dict, lang2)
    };
    return [translate, actions];
  };
  var I18nContext = createContext({});
  var useI18n = () => useContext(I18nContext);
  const TextStyled$3 = styled.div`
    font-style: normal;
    font-weight: ${(props) => props.fontWeight};
    font-size: ${(props) => props.fontSize};
    line-height: ${(props) => props.lineHeight};

    color: ${(props) => props.color};
`;
  const Text = (inputs) => {
    const theme = useTheme();
    const [t2] = useI18n();
    let textRef;
    const color = () => inputs.color || theme.colors.text.primary;
    const props = mergeProps({
      fontSize: "14px",
      fontWeight: "510",
      lineHeight: "130%"
    }, inputs);
    createEffect(() => {
      if (!textRef) {
        return;
      }
      if (props.cursor === "unset") {
        return;
      }
      if (getComputedStyle(textRef).cursor !== "pointer") {
        textRef.style.cursor = "default";
      }
    });
    return createComponent(TextStyled$3, {
      get fontSize() {
        return props.fontSize;
      },
      get fontWeight() {
        return props.fontWeight;
      },
      get lineHeight() {
        return props.lineHeight;
      },
      get color() {
        return color();
      },
      get ["class"]() {
        return props.class;
      },
      ref(r$) {
        const _ref$ = textRef;
        typeof _ref$ === "function" ? _ref$(r$) : textRef = r$;
      },
      "data-tc-text": "true",
      get children() {
        var _a2;
        return createMemo(() => !!props.translationKey)() ? t2(props.translationKey, props.translationValues, (_a2 = props.children) == null ? void 0 : _a2.toString()) : props.children;
      }
    });
  };
  const ImageContainer = styled.div`
    position: relative;

    &::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        border: 0.5px solid rgba(0, 0, 0, 0.08);

        border-radius: inherit;
    }
`;
  const ImageStyled$2 = styled(Image)`
    width: 100%;
    height: 100%;
    border-radius: inherit;
`;
  const WalletImage = (props) => {
    return createComponent(ImageContainer, {
      get ["class"]() {
        return props.class;
      },
      get children() {
        return createComponent(ImageStyled$2, {
          get src() {
            return props.src;
          }
        });
      }
    });
  };
  const borders$3 = {
    m: "16px",
    s: "12px",
    none: "0"
  };
  const badgeBorders = {
    m: "6px",
    s: "6px",
    none: "0"
  };
  const WalletItemStyled = styled.button`
    position: relative;
    cursor: pointer;
    border: none;
    background-color: unset;
    padding: 8px 4px;
    width: 92px;
    display: flex;
    flex-direction: column;
    align-items: center;

    transition: transform 0.125s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.04);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    ${media("mobile")} {
        padding: 8px 4px;
        width: 82px;
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.92);
        }
    }
`;
  const ImageStyled$1 = styled(WalletImage)`
    width: 60px;
    height: 60px;
    border-radius: ${(props) => borders$3[props.theme.borderRadius]};

    margin-bottom: 8px;
`;
  const BadgeStyled = styled(Image)`
    position: absolute;
    right: 10px;
    top: 50px;
    width: 24px;
    height: 24px;
    border-radius: ${(props) => badgeBorders[props.theme.borderRadius]};
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
`;
  const StyledText = styled(Text)`
    font-weight: 590;
    max-width: 76px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
`;
  const StyledSecondLine = styled(Text)`
    font-weight: 510;
    max-width: 76px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    color: ${(props) => props.colorPrimary ? props.theme.colors.text.primary : props.theme.colors.text.secondary};
`;
  const WalletItem = (props) => {
    return createComponent(WalletItemStyled, {
      get ["class"]() {
        return props.class;
      },
      onClick: () => props.onClick(),
      "data-tc-wallet-item": "true",
      get children() {
        return [createMemo(() => createMemo(() => typeof props.icon === "string")() ? createComponent(ImageStyled$1, {
          get src() {
            return props.icon;
          }
        }) : props.icon), createMemo(() => createMemo(() => !!props.badgeUrl)() && createComponent(BadgeStyled, {
          get src() {
            return props.badgeUrl;
          }
        })), createComponent(StyledText, {
          get children() {
            return props.name;
          }
        }), createMemo(() => createMemo(() => !!props.secondLine)() && createComponent(StyledSecondLine, {
          get colorPrimary() {
            var _a2;
            return (_a2 = props.secondLineColorPrimary) != null ? _a2 : true;
          },
          get children() {
            return props.secondLine;
          }
        }))];
      }
    });
  };
  const H1Styled$9 = styled.h1`
    font-style: normal;
    font-weight: 700;
    font-size: 20px;
    line-height: 28px;

    text-align: center;

    color: ${(props) => props.theme.colors.text.primary};

    margin-top: 0;
    margin-bottom: 0;

    cursor: default;
`;
  const H1 = (props) => {
    const [t2] = useI18n();
    return createComponent(H1Styled$9, {
      get ["class"]() {
        return props.class;
      },
      "data-tc-h1": "true",
      get children() {
        var _a2;
        return createMemo(() => !!props.translationKey)() ? t2(props.translationKey, props.translationValues, (_a2 = props.children) == null ? void 0 : _a2.toString()) : props.children;
      }
    });
  };
  const H2Styled$5 = styled.h2`
    font-style: normal;
    font-weight: 510;
    font-size: 16px;
    line-height: 22px;

    text-align: center;

    color: ${(props) => props.theme.colors.text.secondary};

    margin-top: 0;
    margin-bottom: 32px;

    cursor: default;
`;
  const H2 = (props) => {
    const [t2] = useI18n();
    return createComponent(H2Styled$5, {
      get ["class"]() {
        return props.class;
      },
      "data-tc-h2": "true",
      get children() {
        var _a2;
        return createMemo(() => !!props.translationKey)() ? t2(props.translationKey, props.translationValues, (_a2 = props.children) == null ? void 0 : _a2.toString()) : props.children;
      }
    });
  };
  const H3Styled$1 = styled.h3`
    font-style: normal;
    font-weight: 590;
    font-size: 16px;
    line-height: 20px;

    color: ${(props) => props.theme.colors.text.primary};

    margin-top: 0;
    margin-bottom: 0;

    cursor: default;
`;
  const H3 = (props) => {
    const [t2] = useI18n();
    return createComponent(H3Styled$1, {
      "data-tc-h3": "true",
      get ["class"]() {
        return props.class;
      },
      get children() {
        var _a2;
        return createMemo(() => !!props.translationKey)() ? t2(props.translationKey, props.translationValues, (_a2 = props.children) == null ? void 0 : _a2.toString()) : props.children;
      }
    });
  };
  const _tmpl$$r = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.75 7.5C9.33579 7.5 9 7.16421 9 6.75C9 6.33579 9.33579 6 9.75 6H21.25C21.6642 6 22 6.33579 22 6.75V18.25C22 18.6642 21.6642 19 21.25 19C20.8358 19 20.5 18.6642 20.5 18.25V8.56066L6.28033 22.7803C5.98744 23.0732 5.51256 23.0732 5.21967 22.7803C4.92678 22.4874 4.92678 22.0126 5.21967 21.7197L19.4393 7.5H9.75Z"></path></svg>`);
  const LongArrowIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$r.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = fill(), _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "fill", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$q = /* @__PURE__ */ template$1(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.1839 17.7069C13.6405 18.6507 13.3688 19.1226 13.0591 19.348C12.4278 19.8074 11.5723 19.8074 10.941 19.348C10.6312 19.1226 10.3595 18.6507 9.81613 17.7069L5.52066 10.2464C4.76864 8.94024 4.39263 8.28717 4.33762 7.75894C4.2255 6.68236 4.81894 5.65591 5.80788 5.21589C6.29309 5 7.04667 5 8.55383 5H15.4462C16.9534 5 17.7069 5 18.1922 5.21589C19.1811 5.65591 19.7745 6.68236 19.6624 7.75894C19.6074 8.28717 19.2314 8.94024 18.4794 10.2464L14.1839 17.7069ZM11.1 16.3412L6.56139 8.48002C6.31995 8.06185 6.19924 7.85276 6.18146 7.68365C6.14523 7.33896 6.33507 7.01015 6.65169 6.86919C6.80703 6.80002 7.04847 6.80002 7.53133 6.80002H7.53134L11.1 6.80002V16.3412ZM12.9 16.3412L17.4387 8.48002C17.6801 8.06185 17.8008 7.85276 17.8186 7.68365C17.8548 7.33896 17.665 7.01015 17.3484 6.86919C17.193 6.80002 16.9516 6.80002 16.4687 6.80002L12.9 6.80002V16.3412Z"></path></svg>`);
  const TonIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.primary;
    return (() => {
      const _el$ = _tmpl$$q.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$p = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0_3783_2045)"><circle cx="8" cy="8.00098" r="8"></circle><path d="M4.75 8.50098L7 10.751L11.75 6.00098" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></g><defs><clipPath id="clip0_3783_2045"><rect width="16" height="16" fill="white" transform="translate(0 0.000976562)"></rect></clipPath></defs></svg>`), _tmpl$2$3 = /* @__PURE__ */ template$1(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11"></circle><path d="M17.1364 9.6364C17.4879 9.28493 17.4879 8.71508 17.1364 8.36361C16.7849 8.01214 16.2151 8.01214 15.8636 8.36361L10 14.2272L8.1364 12.3636C7.78493 12.0121 7.21508 12.0121 6.86361 12.3636C6.51214 12.7151 6.51214 13.2849 6.86361 13.6364L9.36361 16.1364C9.71508 16.4879 10.2849 16.4879 10.6364 16.1364L17.1364 9.6364Z"></path></svg>`), _tmpl$3$2 = /* @__PURE__ */ template$1(`<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="33"></circle><path d="M50.9142 28.4142C51.6953 27.6332 51.6953 26.3668 50.9142 25.5858C50.1332 24.8047 48.8668 24.8047 48.0858 25.5858L30 43.6716L23.9142 37.5858C23.1332 36.8047 21.8668 36.8047 21.0858 37.5858C20.3047 38.3668 20.3047 39.6332 21.0858 40.4142L28.5858 47.9142C29.3668 48.6953 30.6332 48.6953 31.4142 47.9142L50.9142 28.4142Z"></path></svg>`);
  const SuccessIcon = (props) => {
    const theme = useTheme();
    const size = () => props.size || "s";
    const fill = () => props.fill || theme.colors.icon.success;
    return createMemo((() => {
      const _c$ = createMemo(() => size() === "xs");
      return () => _c$() ? (() => {
        const _el$ = _tmpl$$p.cloneNode(true), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling;
        createRenderEffect((_p$) => {
          const _v$ = props.class, _v$2 = fill(), _v$3 = theme.colors.constant.white;
          _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
          _v$2 !== _p$._v$2 && setAttribute(_el$3, "fill", _p$._v$2 = _v$2);
          _v$3 !== _p$._v$3 && setAttribute(_el$4, "stroke", _p$._v$3 = _v$3);
          return _p$;
        }, {
          _v$: void 0,
          _v$2: void 0,
          _v$3: void 0
        });
        return _el$;
      })() : (() => {
        const _c$2 = createMemo(() => size() === "s");
        return () => _c$2() ? (() => {
          const _el$5 = _tmpl$2$3.cloneNode(true), _el$6 = _el$5.firstChild, _el$7 = _el$6.nextSibling;
          createRenderEffect((_p$) => {
            const _v$4 = props.class, _v$5 = fill(), _v$6 = theme.colors.constant.white;
            _v$4 !== _p$._v$4 && setAttribute(_el$5, "class", _p$._v$4 = _v$4);
            _v$5 !== _p$._v$5 && setAttribute(_el$6, "fill", _p$._v$5 = _v$5);
            _v$6 !== _p$._v$6 && setAttribute(_el$7, "fill", _p$._v$6 = _v$6);
            return _p$;
          }, {
            _v$4: void 0,
            _v$5: void 0,
            _v$6: void 0
          });
          return _el$5;
        })() : (() => {
          const _el$8 = _tmpl$3$2.cloneNode(true), _el$9 = _el$8.firstChild, _el$10 = _el$9.nextSibling;
          createRenderEffect((_p$) => {
            const _v$7 = props.class, _v$8 = fill(), _v$9 = theme.colors.constant.white;
            _v$7 !== _p$._v$7 && setAttribute(_el$8, "class", _p$._v$7 = _v$7);
            _v$8 !== _p$._v$8 && setAttribute(_el$9, "fill", _p$._v$8 = _v$8);
            _v$9 !== _p$._v$9 && setAttribute(_el$10, "fill", _p$._v$9 = _v$9);
            return _p$;
          }, {
            _v$7: void 0,
            _v$8: void 0,
            _v$9: void 0
          });
          return _el$8;
        })();
      })();
    })());
  };
  const _tmpl$$o = /* @__PURE__ */ template$1(`<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="36" cy="36" r="33"></circle><path d="M24.0858 26.9142C23.3047 26.1332 23.3047 24.8668 24.0858 24.0858C24.8668 23.3047 26.1332 23.3047 26.9142 24.0858L36 33.1716L45.0858 24.0858C45.8668 23.3047 47.1332 23.3047 47.9142 24.0858C48.6953 24.8668 48.6953 26.1332 47.9142 26.9142L38.8284 36L47.9142 45.0858C48.6953 45.8668 48.6953 47.1332 47.9142 47.9142C47.1332 48.6953 45.8668 48.6953 45.0858 47.9142L36 38.8284L26.9142 47.9142C26.1332 48.6953 24.8668 48.6953 24.0858 47.9142C23.3047 47.1332 23.3047 45.8668 24.0858 45.0858L33.1716 36L24.0858 26.9142Z"></path></svg>`), _tmpl$2$2 = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24.001" r="22"></circle><path d="M24 24.001L31.5 16.501M24 24.001L16.5 16.501M24 24.001L16.5 31.501M24 24.001L31.5 31.501" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>`), _tmpl$3$1 = /* @__PURE__ */ template$1(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="11"></circle><path d="M7.86361 9.1364C7.51214 8.78493 7.51214 8.21508 7.86361 7.86361C8.21508 7.51214 8.78493 7.51214 9.1364 7.86361L12 10.7272L14.8636 7.86361C15.2151 7.51214 15.7849 7.51214 16.1364 7.86361C16.4879 8.21508 16.4879 8.78493 16.1364 9.1364L13.2728 12L16.1364 14.8636C16.4879 15.2151 16.4879 15.7849 16.1364 16.1364C15.7849 16.4879 15.2151 16.4879 14.8636 16.1364L12 13.2728L9.1364 16.1364C8.78493 16.4879 8.21508 16.4879 7.86361 16.1364C7.51214 15.7849 7.51214 15.2151 7.86361 14.8636L10.7272 12L7.86361 9.1364Z"></path></svg>`);
  const ErrorIcon = (props) => {
    const theme = useTheme();
    const size = () => props.size || "m";
    const fill = () => props.fill || theme.colors.icon.error;
    return createMemo((() => {
      const _c$ = createMemo(() => size() === "m");
      return () => _c$() ? (() => {
        const _el$ = _tmpl$$o.cloneNode(true), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
        createRenderEffect((_p$) => {
          const _v$ = props.class, _v$2 = fill(), _v$3 = theme.colors.constant.white;
          _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
          _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
          _v$3 !== _p$._v$3 && setAttribute(_el$3, "fill", _p$._v$3 = _v$3);
          return _p$;
        }, {
          _v$: void 0,
          _v$2: void 0,
          _v$3: void 0
        });
        return _el$;
      })() : (() => {
        const _c$2 = createMemo(() => size() === "s");
        return () => _c$2() ? (() => {
          const _el$4 = _tmpl$2$2.cloneNode(true), _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling;
          createRenderEffect((_p$) => {
            const _v$4 = props.class, _v$5 = fill(), _v$6 = theme.colors.constant.white;
            _v$4 !== _p$._v$4 && setAttribute(_el$4, "class", _p$._v$4 = _v$4);
            _v$5 !== _p$._v$5 && setAttribute(_el$5, "fill", _p$._v$5 = _v$5);
            _v$6 !== _p$._v$6 && setAttribute(_el$6, "stroke", _p$._v$6 = _v$6);
            return _p$;
          }, {
            _v$4: void 0,
            _v$5: void 0,
            _v$6: void 0
          });
          return _el$4;
        })() : (() => {
          const _el$7 = _tmpl$3$1.cloneNode(true), _el$8 = _el$7.firstChild, _el$9 = _el$8.nextSibling;
          createRenderEffect((_p$) => {
            const _v$7 = props.class, _v$8 = fill(), _v$9 = theme.colors.constant.white;
            _v$7 !== _p$._v$7 && setAttribute(_el$7, "class", _p$._v$7 = _v$7);
            _v$8 !== _p$._v$8 && setAttribute(_el$8, "fill", _p$._v$8 = _v$8);
            _v$9 !== _p$._v$9 && setAttribute(_el$9, "fill", _p$._v$9 = _v$9);
            return _p$;
          }, {
            _v$7: void 0,
            _v$8: void 0,
            _v$9: void 0
          });
          return _el$7;
        })();
      })();
    })());
  };
  const _tmpl$$n = /* @__PURE__ */ template$1(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.55 5.85123C18.9459 7.81184 20.1094 12.1541 18.1488 15.55C16.1882 18.9459 11.8459 20.1094 8.44998 18.1488C8.01952 17.9003 7.46909 18.0478 7.22056 18.4782C6.97203 18.9087 7.11952 19.4591 7.54998 19.7076C11.8068 22.1653 17.2499 20.7068 19.7076 16.45C22.1653 12.1932 20.7068 6.75005 16.45 4.29239C12.1932 1.83472 6.75003 3.29321 4.29236 7.55001C4.04383 7.98047 4.19132 8.53091 4.62178 8.77943C5.05224 9.02796 5.60268 8.88048 5.8512 8.45001C7.81181 5.05413 12.1541 3.89062 15.55 5.85123Z"></path></svg>`), _tmpl$2$1 = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M22 2.99951C11.5066 2.99951 3 11.5061 3 21.9995C3 32.4929 11.5066 40.9995 22 40.9995C22.8284 40.9995 23.5 41.6711 23.5 42.4995C23.5 43.3279 22.8284 43.9995 22 43.9995C9.84974 43.9995 0 34.1498 0 21.9995C0 9.84925 9.84974 -0.000488281 22 -0.000488281C34.1503 -0.000488281 44 9.84925 44 21.9995C44 22.8279 43.3284 23.4995 42.5 23.4995C41.6716 23.4995 41 22.8279 41 21.9995C41 11.5061 32.4934 2.99951 22 2.99951Z"></path></svg>`), _tmpl$3 = /* @__PURE__ */ template$1(`<svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 56.7846C35.479 63.412 50.1572 59.479 56.7846 47.9999C63.412 36.5209 59.479 21.8427 48 15.2153C36.521 8.58791 21.8428 12.5209 15.2154 23.9999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path></svg>`);
  const LoaderIcon = (props) => {
    const theme = useTheme();
    const size = () => props.size || "xs";
    const fill = () => props.fill || theme.colors.icon.tertiary;
    const rotateAnimation = h`
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
    `;
    const svgClass = u`
        animation: ${rotateAnimation} 1s linear infinite;
    `;
    return createMemo((() => {
      const _c$ = createMemo(() => size() === "xs");
      return () => _c$() ? (() => {
        const _el$ = _tmpl$$n.cloneNode(true), _el$2 = _el$.firstChild;
        createRenderEffect((_p$) => {
          const _v$ = cn__default.default(svgClass, props.class), _v$2 = fill();
          _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
          _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
          return _p$;
        }, {
          _v$: void 0,
          _v$2: void 0
        });
        return _el$;
      })() : (() => {
        const _c$2 = createMemo(() => size() === "s");
        return () => _c$2() ? (() => {
          const _el$3 = _tmpl$2$1.cloneNode(true), _el$4 = _el$3.firstChild;
          createRenderEffect((_p$) => {
            const _v$3 = cn__default.default(svgClass, props.class), _v$4 = fill();
            _v$3 !== _p$._v$3 && setAttribute(_el$3, "class", _p$._v$3 = _v$3);
            _v$4 !== _p$._v$4 && setAttribute(_el$4, "fill", _p$._v$4 = _v$4);
            return _p$;
          }, {
            _v$3: void 0,
            _v$4: void 0
          });
          return _el$3;
        })() : (() => {
          const _el$5 = _tmpl$3.cloneNode(true), _el$6 = _el$5.firstChild;
          createRenderEffect((_p$) => {
            const _v$5 = cn__default.default(svgClass, props.class), _v$6 = fill();
            _v$5 !== _p$._v$5 && setAttribute(_el$5, "class", _p$._v$5 = _v$5);
            _v$6 !== _p$._v$6 && setAttribute(_el$6, "stroke", _p$._v$6 = _v$6);
            return _p$;
          }, {
            _v$5: void 0,
            _v$6: void 0
          });
          return _el$5;
        })();
      })();
    })());
  };
  const _tmpl$$m = /* @__PURE__ */ template$1(`<svg width="158" height="28" viewBox="0 0 158 28" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M28 14.001C28 21.733 21.732 28.001 14 28.001C6.26801 28.001 0 21.733 0 14.001C0 6.26899 6.26801 0.000976562 14 0.000976562C21.732 0.000976562 28 6.26899 28 14.001ZM9.21931 8.00098H18.7801H18.7813C20.538 8.00098 21.6522 9.89966 20.7691 11.4302L14.8672 21.6576C14.4822 22.3254 13.5172 22.3254 13.1322 21.6576L7.23158 11.4302C6.34721 9.89726 7.4614 8.00098 9.21931 8.00098ZM13.1262 18.5882V9.74806H9.21811C8.78976 9.74806 8.53708 10.2029 8.74163 10.5578L11.8423 16.1035L13.1262 18.5882ZM16.1559 16.1047L19.2554 10.5566C19.4599 10.2017 19.2073 9.74685 18.7789 9.74685H14.8709V18.5906L16.1559 16.1047Z" fill="#0098EA"></path><path d="M18.7802 8.00098H9.21936C7.46145 8.00098 6.34727 9.89726 7.23164 11.4302L13.1322 21.6576C13.5173 22.3254 14.4823 22.3254 14.8673 21.6576L20.7691 11.4302C21.6523 9.89966 20.5381 8.00098 18.7814 8.00098H18.7802ZM13.1274 18.5906L11.8424 16.1035L8.74168 10.5578C8.53714 10.2029 8.78981 9.74806 9.21816 9.74806H13.1262V18.5918L13.1274 18.5906ZM19.2555 10.5566L16.156 16.1047L14.8709 18.5906V9.74685H18.779C19.2073 9.74685 19.46 10.2017 19.2555 10.5566Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M51.7483 22.1967C55.7182 22.1967 58.9609 18.954 58.9609 14.9841C58.9609 11.0142 55.7182 7.77148 51.7483 7.77148C47.7588 7.77148 44.5357 11.0142 44.5357 14.9841C44.5357 18.954 47.7588 22.1967 51.7483 22.1967ZM51.7483 19.1702C49.4686 19.1702 47.6802 17.2442 47.6802 14.9841C47.6802 12.724 49.4686 10.798 51.7483 10.798C54.0084 10.798 55.7968 12.724 55.7968 14.9841C55.7968 17.2442 54.0084 19.1702 51.7483 19.1702ZM37.0698 21.9609H40.2142V10.9946H44.2843V8.00732H33V10.9946H37.0698V21.9609ZM69.9379 8.00732H73.0823V21.9609H70.3899L63.59 13.3333V21.9609H60.4652V8.00732H63.1576L69.9379 16.6153V8.00732ZM79.2259 14.9887C79.2259 10.9202 82.351 7.77539 86.4982 7.77539C89.8592 7.77539 92.5519 9.95709 93.2202 12.6891H90.7437C90.154 11.0971 88.4637 9.9964 86.4982 9.9964C83.5893 9.9964 81.5452 12.1781 81.5452 14.9887C81.5452 17.7994 83.5893 19.9811 86.4982 19.9811C88.4637 19.9811 90.154 18.8804 90.7437 17.2884H93.2202C92.5519 20.0204 89.8592 22.2021 86.4982 22.2021C82.351 22.2021 79.2259 19.0573 79.2259 14.9887ZM104.584 17.0525C104.584 19.9025 102.343 22.1628 99.4342 22.1628C96.5253 22.1628 94.2846 19.9025 94.2846 17.0525C94.2846 14.2025 96.5253 11.9422 99.4342 11.9422C102.343 11.9422 104.584 14.2025 104.584 17.0525ZM96.4663 17.0525C96.4663 18.8018 97.6849 20.158 99.4342 20.158C101.164 20.158 102.382 18.8018 102.382 17.0525C102.382 15.3032 101.164 13.947 99.4342 13.947C97.6849 13.947 96.4663 15.3032 96.4663 17.0525ZM108.626 12.1388H106.463V21.9662H108.626V17.1311C108.626 15.0281 109.726 13.9077 111.161 13.9077C112.419 13.9077 113.205 14.8512 113.205 16.4039V21.9662H115.367V16.0501C115.367 13.5539 113.893 11.9422 111.613 11.9422C110.335 11.9422 109.215 12.4926 108.626 13.4753V12.1388ZM117.839 12.1388H120.001V13.4753C120.59 12.4926 121.711 11.9422 122.988 11.9422C125.268 11.9422 126.742 13.5539 126.742 16.0501V21.9662H124.58V16.4039C124.58 14.8512 123.794 13.9077 122.536 13.9077C121.101 13.9077 120.001 15.0281 120.001 17.1311V21.9662H117.839V12.1388ZM133.558 22.1628C136.054 22.1628 137.823 20.728 138.373 18.8804H136.113C135.661 19.8238 134.717 20.2563 133.636 20.2563C131.887 20.2563 130.747 19.077 130.668 17.5832H138.491C138.688 14.2419 136.585 11.9422 133.577 11.9422C130.551 11.9422 128.526 14.1436 128.526 17.0525C128.526 20.0007 130.629 22.1628 133.558 22.1628ZM130.747 16.0501C131.042 14.5367 132.162 13.7505 133.518 13.7505C134.717 13.7505 135.838 14.4581 136.172 16.0501H130.747ZM149.851 18.3694C149.32 20.5511 147.453 22.1628 144.859 22.1628C141.871 22.1628 139.709 19.8828 139.709 17.0525C139.709 14.2222 141.871 11.9422 144.859 11.9422C147.453 11.9422 149.32 13.5539 149.851 15.7356H147.571C147.178 14.6743 146.215 13.9077 144.859 13.9077C143.109 13.9077 141.91 15.2246 141.91 17.0525C141.91 18.8804 143.109 20.1973 144.859 20.1973C146.215 20.1973 147.178 19.4307 147.571 18.3694H149.851ZM155.75 22.0645C156.418 22.0645 156.929 21.9859 157.362 21.8483V19.9221C157.047 20.0401 156.615 20.1187 156.202 20.1187C155.082 20.1187 154.551 19.6666 154.551 18.448V14.065H157.362V12.1388H154.551V9.40675H152.389V12.1388H150.345V14.065H152.389V18.8018C152.389 21.0228 153.863 22.0645 155.75 22.0645Z"></path></svg>`);
  const TonConnectBrand = () => {
    const theme = useTheme();
    const fill = () => theme.theme === THEME.DARK ? theme.colors.constant.white : theme.colors.constant.black;
    return (() => {
      const _el$ = _tmpl$$m.cloneNode(true), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling;
      createRenderEffect(() => setAttribute(_el$4, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$l = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.56608 4.42584C5.82527 3.32158 6.8176 2.5 8.00001 2.5C9.38072 2.5 10.5 3.61929 10.5 5C10.5 5.63026 10.3391 6.0386 10.1264 6.34455C9.90018 6.66993 9.58561 6.92478 9.18864 7.20877C9.12579 7.25372 9.05873 7.30025 8.9887 7.34883C8.27392 7.84472 7.25001 8.55507 7.25001 10V10.25C7.25001 10.6642 7.5858 11 8.00001 11C8.41422 11 8.75001 10.6642 8.75001 10.25V10C8.75001 9.36502 9.10777 9.1096 9.94554 8.51149L10.0614 8.42873C10.4769 8.13147 10.9748 7.75194 11.358 7.20076C11.7547 6.63015 12 5.91973 12 5C12 2.79086 10.2091 1 8.00001 1C6.10564 1 4.5205 2.31615 4.10577 4.08308C4.01112 4.48634 4.26129 4.88997 4.66454 4.98462C5.0678 5.07927 5.47143 4.8291 5.56608 4.42584ZM8.00001 15C8.60752 15 9.10001 14.5075 9.10001 13.9C9.10001 13.2925 8.60752 12.8 8.00001 12.8C7.39249 12.8 6.90001 13.2925 6.90001 13.9C6.90001 14.5075 7.39249 15 8.00001 15Z"></path></svg>`);
  const QuestionIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$l.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$k = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.98156 8.75C9.84854 11.4328 9.01206 13.5 8 13.5C6.98794 13.5 6.15146 11.4328 6.01844 8.75H9.98156ZM11.4832 8.75C11.4217 10.1155 11.1929 11.3869 10.8239 12.4017C10.7734 12.5405 10.7188 12.6789 10.6595 12.8154C12.1454 11.993 13.2103 10.5029 13.4493 8.75H11.4832ZM13.4493 7.25H11.4832C11.4217 5.88453 11.1929 4.61314 10.8239 3.5983C10.7734 3.4595 10.7188 3.32111 10.6595 3.18459C12.1454 4.00697 13.2103 5.49709 13.4493 7.25ZM9.98156 7.25H6.01844C6.15144 4.56764 6.98769 2.50062 7.99955 2.5H8C9.01206 2.5 9.84854 4.56724 9.98156 7.25ZM4.51678 7.25C4.57826 5.88453 4.80706 4.61314 5.1761 3.5983C5.22657 3.4595 5.28124 3.32111 5.3405 3.18459C3.85463 4.00697 2.78972 5.49709 2.55071 7.25H4.51678ZM2.55071 8.75C2.78972 10.5029 3.85463 11.993 5.3405 12.8154C5.28124 12.6789 5.22657 12.5405 5.1761 12.4017C4.80706 11.3869 4.57826 10.1155 4.51678 8.75H2.55071ZM15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"></path></svg>`);
  const BrowserIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.primary;
    return (() => {
      const _el$ = _tmpl$$k.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$j = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M2.5 4.8C2.5 3.11984 2.5 2.27976 2.82698 1.63803C3.1146 1.07354 3.57354 0.614601 4.13803 0.32698C4.77976 0 5.61984 0 7.3 0H8.7C10.3802 0 11.2202 0 11.862 0.32698C12.4265 0.614601 12.8854 1.07354 13.173 1.63803C13.5 2.27976 13.5 3.11984 13.5 4.8V11.2C13.5 12.8802 13.5 13.7202 13.173 14.362C12.8854 14.9265 12.4265 15.3854 11.862 15.673C11.2202 16 10.3802 16 8.7 16H7.3C5.61984 16 4.77976 16 4.13803 15.673C3.57354 15.3854 3.1146 14.9265 2.82698 14.362C2.5 13.7202 2.5 12.8802 2.5 11.2V4.8ZM4 3.9C4 3.05992 4 2.63988 4.16349 2.31901C4.3073 2.03677 4.53677 1.8073 4.81901 1.66349C5.13988 1.5 5.55992 1.5 6.4 1.5H9.6C10.4401 1.5 10.8601 1.5 11.181 1.66349C11.4632 1.8073 11.6927 2.03677 11.8365 2.31901C12 2.63988 12 3.05992 12 3.9V12.1C12 12.9401 12 13.3601 11.8365 13.681C11.6927 13.9632 11.4632 14.1927 11.181 14.3365C10.8601 14.5 10.4401 14.5 9.6 14.5H6.4C5.55992 14.5 5.13988 14.5 4.81901 14.3365C4.53677 14.1927 4.3073 13.9632 4.16349 13.681C4 13.3601 4 12.9401 4 12.1V3.9ZM7 2.5C6.58579 2.5 6.25 2.83579 6.25 3.25C6.25 3.66421 6.58579 4 7 4H9C9.41421 4 9.75 3.66421 9.75 3.25C9.75 2.83579 9.41421 2.5 9 2.5H7Z"></path></svg>`);
  const MobileIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.primary;
    return (() => {
      const _el$ = _tmpl$$j.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$i = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 6.8C1.5 5.11984 1.5 4.27976 1.82698 3.63803C2.1146 3.07354 2.57354 2.6146 3.13803 2.32698C3.77976 2 4.61984 2 6.3 2H9.7C11.3802 2 12.2202 2 12.862 2.32698C13.4265 2.6146 13.8854 3.07354 14.173 3.63803C14.5 4.27976 14.5 5.11984 14.5 6.8V11.5H15.25C15.6642 11.5 16 11.8358 16 12.25C16 12.6642 15.6642 13 15.25 13H0.75C0.335786 13 0 12.6642 0 12.25C0 11.8358 0.335786 11.5 0.75 11.5H1.5V6.8ZM3 11.5H13V5.9C13 5.05992 13 4.63988 12.8365 4.31901C12.6927 4.03677 12.4632 3.8073 12.181 3.66349C11.8601 3.5 11.4401 3.5 10.6 3.5H5.4C4.55992 3.5 4.13988 3.5 3.81901 3.66349C3.53677 3.8073 3.3073 4.03677 3.16349 4.31901C3 4.63988 3 5.05992 3 5.9V11.5Z"></path></svg>`);
  const DesktopIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.primary;
    return (() => {
      const _el$ = _tmpl$$i.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$h = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none"><g clip-path="url(#clip0_3676_1603)"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.5 1.25049C15.5 0.836275 15.1642 0.500488 14.75 0.500488C14.3358 0.500488 14 0.836275 14 1.25049V3.67012C12.7187 2.04487 10.7318 1.00049 8.5 1.00049C4.63401 1.00049 1.5 4.1345 1.5 8.00049C1.5 11.8665 4.63401 15.0005 8.5 15.0005C11.6844 15.0005 14.3703 12.8748 15.2199 9.96661C15.3361 9.56902 15.1079 9.15254 14.7103 9.03638C14.3127 8.92023 13.8962 9.14838 13.7801 9.54597C13.1123 11.8319 11 13.5005 8.5 13.5005C5.46243 13.5005 3 11.0381 3 8.00049C3 4.96292 5.46243 2.50049 8.5 2.50049C10.321 2.50049 11.9363 3.3855 12.9377 4.75049H10.5C10.0858 4.75049 9.75 5.08627 9.75 5.50049C9.75 5.9147 10.0858 6.25049 10.5 6.25049H14.75C15.1642 6.25049 15.5 5.9147 15.5 5.50049V1.25049Z"></path></g><defs><clipPath id="clip0_3676_1603"><rect width="16" height="16" fill="white" transform="translate(0.5 0.000488281)"></rect></clipPath></defs></svg>`);
  const RetryIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.accent;
    return (() => {
      const _el$ = _tmpl$$h.cloneNode(true), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
      createRenderEffect(() => setAttribute(_el$3, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$g = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M13 4.06119V6.75053C13 7.16474 13.3358 7.50053 13.75 7.50053C14.1642 7.50053 14.5 7.16474 14.5 6.75053V2.75053L14.5 2.72807C14.5001 2.63191 14.5003 2.49627 14.4842 2.37627C14.4638 2.22503 14.4063 1.99261 14.2071 1.79342C14.0079 1.59423 13.7755 1.5367 13.6243 1.51637C13.5043 1.50023 13.3686 1.50039 13.2725 1.50051L13.25 1.50053H9.25C8.83579 1.50053 8.5 1.83631 8.5 2.25053C8.5 2.66474 8.83579 3.00053 9.25 3.00053H11.9393L7.21967 7.7202C6.92678 8.01309 6.92678 8.48796 7.21967 8.78086C7.51256 9.07375 7.98744 9.07375 8.28033 8.78086L13 4.06119ZM5.85 1.50053H5.81903H5.81899C5.21528 1.50052 4.71702 1.50051 4.31113 1.53367C3.88956 1.56812 3.50203 1.64204 3.13803 1.82751C2.57354 2.11513 2.1146 2.57407 1.82698 3.13856C1.64151 3.50256 1.56759 3.89009 1.53315 4.31166C1.49998 4.71755 1.49999 5.21581 1.5 5.81953V5.81955V5.85053V10.1505V10.1815V10.1815C1.49999 10.7852 1.49998 11.2835 1.53315 11.6894C1.56759 12.111 1.64151 12.4985 1.82698 12.8625C2.1146 13.427 2.57354 13.8859 3.13803 14.1735C3.50203 14.359 3.88956 14.4329 4.31113 14.4674C4.71702 14.5005 5.21527 14.5005 5.81897 14.5005H5.81901H5.85H10.15H10.181H10.181C10.7847 14.5005 11.283 14.5005 11.6889 14.4674C12.1104 14.4329 12.498 14.359 12.862 14.1735C13.4265 13.8859 13.8854 13.427 14.173 12.8625C14.3585 12.4985 14.4324 12.111 14.4669 11.6894C14.5 11.2835 14.5 10.7853 14.5 10.1816V10.1815V10.1505V9.75053C14.5 9.33631 14.1642 9.00053 13.75 9.00053C13.3358 9.00053 13 9.33631 13 9.75053V10.1505C13 10.793 12.9994 11.2297 12.9718 11.5672C12.945 11.8961 12.8963 12.0642 12.8365 12.1815C12.6927 12.4638 12.4632 12.6932 12.181 12.837C12.0637 12.8968 11.8955 12.9455 11.5667 12.9724C11.2292 12.9999 10.7924 13.0005 10.15 13.0005H5.85C5.20757 13.0005 4.77085 12.9999 4.43328 12.9724C4.10447 12.9455 3.93632 12.8968 3.81902 12.837C3.53677 12.6932 3.3073 12.4638 3.16349 12.1815C3.10372 12.0642 3.05503 11.8961 3.02816 11.5672C3.00058 11.2297 3 10.793 3 10.1505V5.85053C3 5.20809 3.00058 4.77137 3.02816 4.43381C3.05503 4.10499 3.10372 3.93684 3.16349 3.81954C3.3073 3.5373 3.53677 3.30783 3.81902 3.16402C3.93632 3.10425 4.10447 3.05556 4.43328 3.02869C4.77085 3.00111 5.20757 3.00053 5.85 3.00053H6.25C6.66422 3.00053 7 2.66474 7 2.25053C7 1.83631 6.66422 1.50053 6.25 1.50053H5.85Z"></path></svg>`);
  const LinkIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.accent;
    return (() => {
      const _el$ = _tmpl$$g.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$f = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none"><g clip-path="url(#clip0_3676_1274)"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.82698 2.63901C1.5 3.28074 1.5 4.12082 1.5 5.80098V8.80098V9.00098V10.201C1.5 11.8811 1.5 12.7212 1.82698 13.3629C2.1146 13.9274 2.57354 14.3864 3.13803 14.674C3.77976 15.001 4.61984 15.001 6.3 15.001H11.7C13.3802 15.001 14.2202 15.001 14.862 14.674C15.4265 14.3864 15.8854 13.9274 16.173 13.3629C16.5 12.7212 16.5 11.8811 16.5 10.201V8.80098C16.5 7.12082 16.5 6.28074 16.173 5.63901C15.8854 5.07452 15.4265 4.61558 14.862 4.32796C14.743 4.26733 14.6172 4.21795 14.4805 4.17772C14.4501 3.49449 14.3722 3.02994 14.173 2.63901C13.8854 2.07452 13.4265 1.61558 12.862 1.32796C12.2202 1.00098 11.3802 1.00098 9.7 1.00098H6.3C4.61984 1.00098 3.77976 1.00098 3.13803 1.32796C2.57354 1.61558 2.1146 2.07452 1.82698 2.63901ZM12.9861 4.00942C12.9684 3.7108 12.9281 3.49982 12.8365 3.31999C12.6927 3.03775 12.4632 2.80828 12.181 2.66447C11.8601 2.50098 11.4401 2.50098 10.6 2.50098H5.4C4.55992 2.50098 4.13988 2.50098 3.81901 2.66447C3.53677 2.80828 3.3073 3.03775 3.16349 3.31999C3.03615 3.56991 3.00799 3.88 3.00177 4.40188C3.04646 4.37612 3.09189 4.35146 3.13803 4.32796C3.77976 4.00098 4.61984 4.00098 6.3 4.00098H11.7C12.1966 4.00098 12.6197 4.00098 12.9861 4.00942ZM3 7.90098V8.10098C3 8.47468 3 8.76527 3.01439 9.00098H3V11.101C3 11.9411 3 12.3611 3.16349 12.682C3.3073 12.9642 3.53677 13.1937 3.81901 13.3375C4.13988 13.501 4.55992 13.501 5.4 13.501H12.6C13.4401 13.501 13.8601 13.501 14.181 13.3375C14.4632 13.1937 14.6927 12.9642 14.8365 12.682C15 12.3611 15 11.9411 15 11.101V7.90098C15 7.0609 15 6.64086 14.8365 6.31999C14.6927 6.03775 14.4632 5.80828 14.181 5.66447C13.8601 5.50098 13.4401 5.50098 12.6 5.50098H5.4C4.55992 5.50098 4.13988 5.50098 3.81901 5.66447C3.53677 5.80828 3.3073 6.03775 3.16349 6.31999C3 6.64086 3 7.0609 3 7.90098ZM10.5 9.75098C10.5 9.33676 10.8358 9.00098 11.25 9.00098H12.75C13.1642 9.00098 13.5 9.33676 13.5 9.75098C13.5 10.1652 13.1642 10.501 12.75 10.501H11.25C10.8358 10.501 10.5 10.1652 10.5 9.75098Z"></path></g><defs><clipPath id="clip0_3676_1274"><rect width="16" height="16" fill="white" transform="translate(0.5 0.000976562)"></rect></clipPath></defs></svg>`);
  const WalletIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.accent;
    return (() => {
      const _el$ = _tmpl$$f.cloneNode(true), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild;
      createRenderEffect(() => setAttribute(_el$3, "fill", fill()));
      return _el$;
    })();
  };
  const _tmpl$$e = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M39.6319 16.8719C38.3212 16.2041 36.7002 16.0478 34 16.0112V11C34 5.47715 29.5228 1 24 1C18.4772 1 14 5.47715 14 11V16.0112C11.2998 16.0478 9.6788 16.2041 8.36808 16.8719C6.86278 17.6389 5.63893 18.8628 4.87195 20.3681C4 22.0794 4 24.3196 4 28.8V32.2C4 36.6804 4 38.9206 4.87195 40.6319C5.63893 42.1372 6.86278 43.3611 8.36808 44.1281C10.0794 45 12.3196 45 16.8 45H31.2C35.6804 45 37.9206 45 39.6319 44.1281C41.1372 43.3611 42.3611 42.1372 43.1281 40.6319C44 38.9206 44 36.6804 44 32.2V28.8C44 24.3196 44 22.0794 43.1281 20.3681C42.3611 18.8628 41.1372 17.6389 39.6319 16.8719ZM31 11V16H17V11C17 7.13401 20.134 4 24 4C27.866 4 31 7.13401 31 11ZM7.54497 21.73C7 22.7996 7 24.1997 7 27V34C7 36.8003 7 38.2004 7.54497 39.27C8.02433 40.2108 8.78924 40.9757 9.73005 41.455C10.7996 42 12.1997 42 15 42H33C35.8003 42 37.2004 42 38.27 41.455C39.2108 40.9757 39.9757 40.2108 40.455 39.27C41 38.2004 41 36.8003 41 34V27C41 24.1997 41 22.7996 40.455 21.73C39.9757 20.7892 39.2108 20.0243 38.27 19.545C37.2004 19 35.8003 19 33 19H15C12.1997 19 10.7996 19 9.73005 19.545C8.78924 20.0243 8.02433 20.7892 7.54497 21.73ZM24 24C23.1716 24 22.5 24.6716 22.5 25.5V29.5C22.5 30.3284 23.1716 31 24 31C24.8284 31 25.5 30.3284 25.5 29.5V25.5C25.5 24.6716 24.8284 24 24 24Z"></path></svg>`);
  const SecurityIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$e.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = props.class, _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$d = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M37.485 37.3849C40.894 33.9506 43 29.2212 43 24C43 13.5066 34.4934 5 24 5C13.5066 5 5 13.5066 5 24C5 29.2213 7.1061 33.9507 10.5151 37.385C13.3583 32.9438 18.3354 30 24.0001 30C29.6647 30 34.6418 32.9437 37.485 37.3849ZM35.1809 39.3635C32.9143 35.5532 28.7554 33 24.0001 33C19.2448 33 15.0858 35.5533 12.8193 39.3636C15.9564 41.6506 19.8206 43 24 43C28.1795 43 32.0437 41.6505 35.1809 39.3635ZM24 46C36.1503 46 46 36.1503 46 24C46 11.8497 36.1503 2 24 2C11.8497 2 2 11.8497 2 24C2 36.1503 11.8497 46 24 46ZM24 24C26.7614 24 29 21.7614 29 19C29 16.2386 26.7614 14 24 14C21.2386 14 19 16.2386 19 19C19 21.7614 21.2386 24 24 24ZM24 27C28.4183 27 32 23.4183 32 19C32 14.5817 28.4183 11 24 11C19.5817 11 16 14.5817 16 19C16 23.4183 19.5817 27 24 27Z"></path></svg>`);
  const PersonalityIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$d.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = props.class, _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$c = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M34.5607 4.43934C33.9749 3.85355 33.0251 3.85355 32.4393 4.43934C31.8536 5.02513 31.8536 5.97487 32.4393 6.56066L37.8787 12H10.5C9.67157 12 9 12.6716 9 13.5C9 14.3284 9.67157 15 10.5 15H37.8787L32.4393 20.4393C31.8536 21.0251 31.8536 21.9749 32.4393 22.5607C33.0251 23.1464 33.9749 23.1464 34.5607 22.5607L42.5607 14.5607C43.1464 13.9749 43.1464 13.0251 42.5607 12.4393L34.5607 4.43934ZM13.4393 25.4393C14.0251 24.8536 14.9749 24.8536 15.5607 25.4393C16.1464 26.0251 16.1464 26.9749 15.5607 27.5607L10.1213 33H37.5C38.3284 33 39 33.6716 39 34.5C39 35.3284 38.3284 36 37.5 36H10.1213L15.5607 41.4393C16.1464 42.0251 16.1464 42.9749 15.5607 43.5607C14.9749 44.1464 14.0251 44.1464 13.4393 43.5607L5.43934 35.5607C4.85355 34.9749 4.85355 34.0251 5.43934 33.4393L13.4393 25.4393Z"></path></svg>`);
  const SwapIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$c.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = props.class, _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$b = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="29" viewBox="0 0 28 29" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1.75 12.002C1.75 9.20169 1.75 7.80156 2.29497 6.732C2.77433 5.79119 3.53924 5.02629 4.48005 4.54692C5.54961 4.00195 6.94974 4.00195 9.75 4.00195H17.25C20.0503 4.00195 21.4504 4.00195 22.52 4.54692C23.4608 5.02629 24.2257 5.79119 24.705 6.732C24.8256 6.96861 24.9195 7.2214 24.9926 7.50195H21.5C19.6377 7.50195 18.7065 7.50195 17.9609 7.77334C16.711 8.22828 15.7263 9.21291 15.2714 10.4629C15 11.2085 15 12.1396 15 14.002C15 15.8643 15 16.7954 15.2714 17.541C15.7263 18.791 16.711 19.7756 17.9609 20.2306C18.7065 20.502 19.6377 20.502 21.5 20.502H24.9926C24.9195 20.7825 24.8256 21.0353 24.705 21.2719C24.2257 22.2127 23.4608 22.9776 22.52 23.457C21.4504 24.002 20.0503 24.002 17.25 24.002H9.75C6.94974 24.002 5.54961 24.002 4.48005 23.457C3.53924 22.9776 2.77433 22.2127 2.29497 21.2719C1.75 20.2023 1.75 18.8022 1.75 16.002V12.002ZM16.4999 13.802C16.4999 12.1218 16.4999 11.2817 16.8269 10.64C17.1145 10.0755 17.5735 9.61656 18.138 9.32894C18.7797 9.00196 19.6198 9.00196 21.2999 9.00196H23.1999C24.8801 9.00196 25.7202 9.00196 26.3619 9.32894C26.9264 9.61656 27.3853 10.0755 27.673 10.64C27.9999 11.2817 27.9999 12.1218 27.9999 13.802V14.202C27.9999 15.8821 27.9999 16.7222 27.673 17.3639C27.3853 17.9284 26.9264 18.3874 26.3619 18.675C25.7202 19.002 24.8801 19.002 23.1999 19.002H21.2999C19.6198 19.002 18.7797 19.002 18.138 18.675C17.5735 18.3874 17.1145 17.9284 16.8269 17.3639C16.4999 16.7222 16.4999 15.8821 16.4999 14.202V13.802ZM22.4999 14.002C22.4999 14.9685 21.7164 15.752 20.7499 15.752C19.7834 15.752 18.9999 14.9685 18.9999 14.002C18.9999 13.0355 19.7834 12.252 20.7499 12.252C21.7164 12.252 22.4999 13.0355 22.4999 14.002Z"></path></svg>`);
  const AtWalletIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.constant.white;
    return (() => {
      const _el$ = _tmpl$$b.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = props.class, _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$a = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M24.7803 7.21967C25.0732 7.51256 25.0732 7.98744 24.7803 8.28033L11.5303 21.5303C11.2374 21.8232 10.7626 21.8232 10.4697 21.5303L4.21967 15.2803C3.92678 14.9874 3.92678 14.5126 4.21967 14.2197C4.51256 13.9268 4.98744 13.9268 5.28033 14.2197L11 19.9393L23.7197 7.21967C24.0126 6.92678 24.4874 6.92678 24.7803 7.21967Z"></path></svg>`);
  const DoneIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$a.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = props.class, _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$9 = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.0001 10.0001C10.0016 8.02333 10.0267 6.98719 10.436 6.18404C10.8195 5.43139 11.4314 4.81947 12.184 4.43597C13.0397 4 14.1598 4 16.4 4H17.6C19.8402 4 20.9603 4 21.816 4.43597C22.5686 4.81947 23.1805 5.43139 23.564 6.18404C24 7.03969 24 8.15979 24 10.4V11.6C24 13.8402 24 14.9603 23.564 15.816C23.1805 16.5686 22.5686 17.1805 21.816 17.564C21.0128 17.9733 19.9767 17.9984 17.9999 17.9999C17.9984 19.9767 17.9733 21.0128 17.564 21.816C17.1805 22.5686 16.5686 23.1805 15.816 23.564C14.9603 24 13.8402 24 11.6 24H10.4C8.15979 24 7.03969 24 6.18404 23.564C5.43139 23.1805 4.81947 22.5686 4.43597 21.816C4 20.9603 4 19.8402 4 17.6V16.4C4 14.1598 4 13.0397 4.43597 12.184C4.81947 11.4314 5.43139 10.8195 6.18404 10.436C6.98719 10.0267 8.02333 10.0016 10.0001 10.0001ZM10 11.5H9.5C8.09987 11.5 7.3998 11.5 6.86502 11.7725C6.39462 12.0122 6.01217 12.3946 5.77248 12.865C5.5 13.3998 5.5 14.0999 5.5 15.5V18.5C5.5 19.9001 5.5 20.6002 5.77248 21.135C6.01217 21.6054 6.39462 21.9878 6.86502 22.2275C7.3998 22.5 8.09987 22.5 9.5 22.5H12.5C13.9001 22.5 14.6002 22.5 15.135 22.2275C15.6054 21.9878 15.9878 21.6054 16.2275 21.135C16.5 20.6002 16.5 19.9001 16.5 18.5V18H16.4C14.1598 18 13.0397 18 12.184 17.564C11.4314 17.1805 10.8195 16.5686 10.436 15.816C10 14.9603 10 13.8402 10 11.6V11.5ZM11.5 9.5C11.5 8.09987 11.5 7.3998 11.7725 6.86502C12.0122 6.39462 12.3946 6.01217 12.865 5.77248C13.3998 5.5 14.0999 5.5 15.5 5.5H18.5C19.9001 5.5 20.6002 5.5 21.135 5.77248C21.6054 6.01217 21.9878 6.39462 22.2275 6.86502C22.5 7.3998 22.5 8.09987 22.5 9.5V12.5C22.5 13.9001 22.5 14.6002 22.2275 15.135C21.9878 15.6054 21.6054 15.9878 21.135 16.2275C20.6002 16.5 19.9001 16.5 18.5 16.5H15.5C14.0999 16.5 13.3998 16.5 12.865 16.2275C12.3946 15.9878 12.0122 15.6054 11.7725 15.135C11.5 14.6002 11.5 13.9001 11.5 12.5V9.5Z"></path></svg>`);
  const CopyLightIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$9.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = fill(), _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "fill", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$8 = /* @__PURE__ */ template$1(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 4.12695C1 3.07754 1 2.55284 1.19202 2.14684C1.38986 1.72856 1.7266 1.39181 2.14489 1.19397C2.55088 1.00195 3.07559 1.00195 4.125 1.00195C5.17441 1.00195 5.69912 1.00195 6.10511 1.19397C6.5234 1.39181 6.86014 1.72856 7.05798 2.14684C7.25 2.55284 7.25 3.07754 7.25 4.12695C7.25 5.17636 7.25 5.70107 7.05798 6.10706C6.86014 6.52535 6.5234 6.8621 6.10511 7.05993C5.69912 7.25195 5.17441 7.25195 4.125 7.25195C3.07559 7.25195 2.55088 7.25195 2.14489 7.05993C1.7266 6.8621 1.38986 6.52535 1.19202 6.10706C1 5.70107 1 5.17636 1 4.12695ZM2.5 3.30195C2.5 3.02193 2.5 2.88191 2.5545 2.77496C2.60243 2.68088 2.67892 2.60439 2.773 2.55645C2.87996 2.50195 3.01997 2.50195 3.3 2.50195H4.95C5.23003 2.50195 5.37004 2.50195 5.477 2.55645C5.57108 2.60439 5.64757 2.68088 5.6955 2.77496C5.75 2.88191 5.75 3.02193 5.75 3.30195V4.95195C5.75 5.23198 5.75 5.37199 5.6955 5.47895C5.64757 5.57303 5.57108 5.64952 5.477 5.69746C5.37004 5.75195 5.23003 5.75195 4.95 5.75195H3.3C3.01997 5.75195 2.87996 5.75195 2.773 5.69746C2.67892 5.64952 2.60243 5.57303 2.5545 5.47895C2.5 5.37199 2.5 5.23198 2.5 4.95195V3.30195ZM1 11.877C1 10.8275 1 10.3028 1.19202 9.89684C1.38986 9.47856 1.7266 9.14181 2.14489 8.94397C2.55088 8.75195 3.07559 8.75195 4.125 8.75195C5.17441 8.75195 5.69912 8.75195 6.10511 8.94397C6.5234 9.14181 6.86014 9.47856 7.05798 9.89684C7.25 10.3028 7.25 10.8275 7.25 11.877C7.25 12.9264 7.25 13.4511 7.05798 13.8571C6.86014 14.2753 6.5234 14.6121 6.10511 14.8099C5.69912 15.002 5.17441 15.002 4.125 15.002C3.07559 15.002 2.55088 15.002 2.14489 14.8099C1.7266 14.6121 1.38986 14.2753 1.19202 13.8571C1 13.4511 1 12.9264 1 11.877ZM2.5 11.052C2.5 10.7719 2.5 10.6319 2.5545 10.525C2.60243 10.4309 2.67892 10.3544 2.773 10.3064C2.87996 10.252 3.01997 10.252 3.3 10.252H4.95C5.23003 10.252 5.37004 10.252 5.477 10.3064C5.57108 10.3544 5.64757 10.4309 5.6955 10.525C5.75 10.6319 5.75 10.7719 5.75 11.052V12.702C5.75 12.982 5.75 13.122 5.6955 13.2289C5.64757 13.323 5.57108 13.3995 5.477 13.4475C5.37004 13.502 5.23003 13.502 4.95 13.502H3.3C3.01997 13.502 2.87996 13.502 2.773 13.4475C2.67892 13.3995 2.60243 13.323 2.5545 13.2289C2.5 13.122 2.5 12.982 2.5 12.702V11.052ZM8.94202 2.14684C8.75 2.55284 8.75 3.07754 8.75 4.12695C8.75 5.17636 8.75 5.70107 8.94202 6.10706C9.13986 6.52535 9.4766 6.8621 9.89489 7.05993C10.3009 7.25195 10.8256 7.25195 11.875 7.25195C12.9244 7.25195 13.4491 7.25195 13.8551 7.05993C14.2734 6.8621 14.6101 6.52535 14.808 6.10706C15 5.70107 15 5.17636 15 4.12695C15 3.07754 15 2.55284 14.808 2.14684C14.6101 1.72856 14.2734 1.39181 13.8551 1.19397C13.4491 1.00195 12.9244 1.00195 11.875 1.00195C10.8256 1.00195 10.3009 1.00195 9.89489 1.19397C9.4766 1.39181 9.13986 1.72856 8.94202 2.14684ZM10.3045 2.77496C10.25 2.88191 10.25 3.02193 10.25 3.30195V4.95195C10.25 5.23198 10.25 5.37199 10.3045 5.47895C10.3524 5.57303 10.4289 5.64952 10.523 5.69746C10.63 5.75195 10.77 5.75195 11.05 5.75195H12.7C12.98 5.75195 13.12 5.75195 13.227 5.69746C13.3211 5.64952 13.3976 5.57303 13.4455 5.47895C13.5 5.37199 13.5 5.23198 13.5 4.95195V3.30195C13.5 3.02193 13.5 2.88191 13.4455 2.77496C13.3976 2.68088 13.3211 2.60439 13.227 2.55645C13.12 2.50195 12.98 2.50195 12.7 2.50195H11.05C10.77 2.50195 10.63 2.50195 10.523 2.55645C10.4289 2.60439 10.3524 2.68088 10.3045 2.77496ZM8.80727 9.13518C8.75 9.26242 8.75 9.4256 8.75 9.75195C8.75 10.0783 8.75 10.2415 8.80727 10.3687C8.87245 10.5136 8.9884 10.6295 9.13323 10.6947C9.26047 10.752 9.42365 10.752 9.75 10.752C10.0764 10.752 10.2395 10.752 10.3668 10.6947C10.5116 10.6295 10.6276 10.5136 10.6927 10.3687C10.75 10.2415 10.75 10.0783 10.75 9.75195C10.75 9.4256 10.75 9.26242 10.6927 9.13518C10.6276 8.99035 10.5116 8.8744 10.3668 8.80922C10.2395 8.75195 10.0764 8.75195 9.75 8.75195C9.42365 8.75195 9.26047 8.75195 9.13323 8.80922C8.9884 8.8744 8.87245 8.99035 8.80727 9.13518ZM10.87 11.8771C10.87 11.546 10.87 11.3805 10.9289 11.2517C10.9938 11.1098 11.1077 10.9959 11.2497 10.931C11.3784 10.8721 11.5439 10.8721 11.875 10.8721C12.2061 10.8721 12.3716 10.8721 12.5003 10.931C12.6423 10.9959 12.7562 11.1098 12.8211 11.2517C12.88 11.3805 12.88 11.546 12.88 11.8771C12.88 12.2081 12.88 12.3737 12.8211 12.5024C12.7562 12.6444 12.6423 12.7583 12.5003 12.8232C12.3716 12.8821 12.2061 12.8821 11.875 12.8821C11.5439 12.8821 11.3784 12.8821 11.2497 12.8232C11.1077 12.7583 10.9938 12.6444 10.9289 12.5024C10.87 12.3737 10.87 12.2081 10.87 11.8771ZM8.80727 13.3852C8.75 13.5124 8.75 13.6756 8.75 14.002C8.75 14.3283 8.75 14.4915 8.80727 14.6187C8.87245 14.7636 8.9884 14.8795 9.13323 14.9447C9.26047 15.002 9.42365 15.002 9.75 15.002C10.0764 15.002 10.2395 15.002 10.3668 14.9447C10.5116 14.8795 10.6276 14.7636 10.6927 14.6187C10.75 14.4915 10.75 14.3283 10.75 14.002C10.75 13.6756 10.75 13.5124 10.6927 13.3852C10.6276 13.2404 10.5116 13.1244 10.3668 13.0592C10.2395 13.002 10.0764 13.002 9.75 13.002C9.42365 13.002 9.26047 13.002 9.13323 13.0592C8.9884 13.1244 8.87245 13.2404 8.80727 13.3852ZM13 9.75195C13 9.4256 13 9.26242 13.0573 9.13518C13.1224 8.99035 13.2384 8.8744 13.3832 8.80922C13.5105 8.75195 13.6736 8.75195 14 8.75195C14.3264 8.75195 14.4895 8.75195 14.6168 8.80922C14.7616 8.8744 14.8776 8.99035 14.9427 9.13518C15 9.26242 15 9.4256 15 9.75195C15 10.0783 15 10.2415 14.9427 10.3687C14.8776 10.5136 14.7616 10.6295 14.6168 10.6947C14.4895 10.752 14.3264 10.752 14 10.752C13.6736 10.752 13.5105 10.752 13.3832 10.6947C13.2384 10.6295 13.1224 10.5136 13.0573 10.3687C13 10.2415 13 10.0783 13 9.75195ZM13.0573 13.3852C13 13.5124 13 13.6756 13 14.002C13 14.3283 13 14.4915 13.0573 14.6187C13.1224 14.7636 13.2384 14.8795 13.3832 14.9447C13.5105 15.002 13.6736 15.002 14 15.002C14.3264 15.002 14.4895 15.002 14.6168 14.9447C14.7616 14.8795 14.8776 14.7636 14.9427 14.6187C15 14.4915 15 14.3283 15 14.002C15 13.6756 15 13.5124 14.9427 13.3852C14.8776 13.2404 14.7616 13.1244 14.6168 13.0592C14.4895 13.002 14.3264 13.002 14 13.002C13.6736 13.002 13.5105 13.002 13.3832 13.0592C13.2384 13.1244 13.1224 13.2404 13.0573 13.3852Z"></path></svg>`);
  const QRIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.secondary;
    return (() => {
      const _el$ = _tmpl$$8.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect(() => setAttribute(_el$2, "fill", fill()));
      return _el$;
    })();
  };
  const containerBorders = {
    m: "16px",
    s: "12px",
    none: "0"
  };
  const walletBorders = {
    m: "6px",
    s: "6px",
    none: "0"
  };
  const FourWalletsCard = styled.div`
    width: 60px;
    height: 60px;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: ${(props) => containerBorders[props.theme.borderRadius]};
    background-color: ${(props) => props.theme.colors.background.tint};
    display: grid;
    grid-template: 1fr 1fr / 1fr 1fr;
    gap: 4px;
`;
  const FourWalletsImage = styled(WalletImage)`
    width: 20px;
    height: 20px;
    border-radius: ${(props) => walletBorders[props.theme.borderRadius]};
`;
  const FourWalletsItem = (props) => {
    return createComponent(WalletItem, {
      get name() {
        return props.labelLine1;
      },
      get secondLine() {
        return props.labelLine2;
      },
      get icon() {
        return createComponent(FourWalletsCard, {
          get children() {
            return createComponent(For, {
              each: [0, 1, 2, 3],
              children: (index) => createComponent(FourWalletsImage, {
                get src() {
                  return props.images[index];
                }
              })
            });
          }
        });
      },
      onClick: () => props.onClick()
    });
  };
  const AT_WALLET_APP_NAME = "telegram-wallet";
  const IMG = {
    TON: "https://raw.githubusercontent.com/ton-connect/sdk/main/assets/ton-icon-48.png",
    TG: "https://raw.githubusercontent.com/ton-connect/sdk/main/assets/tg.png"
  };
  const WalletLabeledItem = (props) => {
    const [t2] = useI18n();
    const walletsSecondLine = () => {
      if (props.wallet.appName === AT_WALLET_APP_NAME) {
        return void 0;
      }
      if ("isPreferred" in props.wallet && props.wallet.isPreferred) {
        return t2("walletItem.recent", {}, "Recent");
      }
      if (sdk.isWalletInfoCurrentlyInjected(props.wallet)) {
        return t2("walletItem.installed", {}, "Installed");
      }
      if (props.wallet.name === "Tonkeeper") {
        return t2("walletItem.popular", {}, "Popular");
      }
      return void 0;
    };
    return createMemo((() => {
      const _c$ = createMemo(() => props.wallet.appName === AT_WALLET_APP_NAME);
      return () => _c$() ? createComponent(WalletItem, {
        get icon() {
          return props.wallet.imageUrl;
        },
        get name() {
          return t2("walletItem.walletOn", {}, "Wallet On");
        },
        secondLine: "Telegram",
        get badgeUrl() {
          return IMG.TG;
        },
        onClick: () => props.onClick()
      }) : createComponent(WalletItem, {
        get icon() {
          return props.wallet.imageUrl;
        },
        get name() {
          return props.wallet.name;
        },
        get secondLine() {
          return walletsSecondLine();
        },
        secondLineColorPrimary: false,
        onClick: () => props.onClick()
      });
    })());
  };
  const ScrollContainerStyled = styled.div`
    width: 100%;
    overflow-y: auto;
    max-height: ${(props) => props.maxHeight};

    scrollbar-width: none;
    &&::-webkit-scrollbar {
        display: none;
    }

    &&::-webkit-scrollbar-track {
        background: transparent;
    }

    &&::-webkit-scrollbar-thumb {
        display: none;
    }
`;
  const ScrollDivider = styled.div`
    height: 1px;
    margin: 0 -24px;
    width: calc(100% + 48px);
    opacity: 0.08;
    background: ${(props) => props.isShown ? props.theme.colors.icon.secondary : "transparent"};
    transition: background 0.15s ease-in-out;

    ${media("mobile")} {
        width: 100%;
        margin: 0;
    }
`;
  const [windowHeight, setWindowHeight] = createSignal(((_a = getWindow$1()) == null ? void 0 : _a.innerHeight) || 0);
  if (getWindow$1()) {
    window.addEventListener("resize", () => setWindowHeight(window.innerHeight));
  }
  const [isMobile, setIsMobile] = createSignal(isDevice("mobile"));
  if (getWindow$1()) {
    window.addEventListener("resize", () => setIsMobile(isDevice("mobile")));
  }
  const ScrollContainer = (props) => {
    const [scrolled, setScrolled] = createSignal(false);
    const onScroll = (e2) => {
      setScrolled(e2.target.scrollTop > 0);
    };
    const offset = () => isMobile() ? 150 : 200;
    const maxHeight = () => props.maxHeight !== void 0 ? `${props.maxHeight}px` : `${windowHeight() - offset()}px`;
    return [createComponent(ScrollDivider, {
      get isShown() {
        return scrolled();
      }
    }), createComponent(ScrollContainerStyled, {
      get maxHeight() {
        return maxHeight();
      },
      onScroll,
      get ["class"]() {
        return props.class;
      },
      get children() {
        return props.children;
      }
    })];
  };
  const AStyled = styled.a`
    display: block;
    text-decoration: unset;
`;
  const Link = (props) => {
    const attributes = () => props.blank ? {
      rel: "noreferrer noopener"
    } : {};
    return createComponent(AStyled, mergeProps({
      get href() {
        return props.href;
      },
      get target() {
        return props.blank ? "_blank" : "_self";
      },
      get ["class"]() {
        return props.class;
      }
    }, attributes, {
      get children() {
        return props.children;
      }
    }));
  };
  const TonConnectUiContext = createContext();
  const _tmpl$$7 = /* @__PURE__ */ template$1(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.76228 2.09998H10.2378C11.0458 2.09997 11.7067 2.09996 12.2438 2.14384C12.7997 2.18926 13.3017 2.28614 13.7706 2.52505C14.5045 2.89896 15.1011 3.49558 15.475 4.22941C15.7139 4.6983 15.8108 5.20038 15.8562 5.75629C15.9001 6.29337 15.9001 6.95422 15.9001 7.76227V8.1H16.2377C17.0457 8.09999 17.7066 8.09998 18.2437 8.14386C18.7996 8.18928 19.3017 8.28616 19.7705 8.52507C20.5044 8.89898 21.101 9.4956 21.4749 10.2294C21.7138 10.6983 21.8107 11.2004 21.8561 11.7563C21.9 12.2934 21.9 12.9542 21.9 13.7623V16.2377C21.9 17.0458 21.9 17.7066 21.8561 18.2437C21.8107 18.7996 21.7138 19.3017 21.4749 19.7706C21.101 20.5044 20.5044 21.101 19.7705 21.4749C19.3017 21.7138 18.7996 21.8107 18.2437 21.8561C17.7066 21.9 17.0458 21.9 16.2378 21.9H13.7623C12.9543 21.9 12.2934 21.9 11.7563 21.8561C11.2004 21.8107 10.6983 21.7138 10.2294 21.4749C9.49561 21.101 8.89898 20.5044 8.52508 19.7706C8.28616 19.3017 8.18928 18.7996 8.14386 18.2437C8.09998 17.7066 8.09999 17.0458 8.1 16.2377V15.9H7.76227C6.95426 15.9 6.29335 15.9 5.75629 15.8561C5.20038 15.8107 4.6983 15.7138 4.22941 15.4749C3.49558 15.101 2.89896 14.5044 2.52505 13.7705C2.28614 13.3017 2.18926 12.7996 2.14384 12.2437C2.09996 11.7066 2.09997 11.0458 2.09998 10.2377V7.76228C2.09997 6.95424 2.09996 6.29336 2.14384 5.75629C2.18926 5.20038 2.28614 4.6983 2.52505 4.22941C2.89896 3.49558 3.49558 2.89896 4.22941 2.52505C4.6983 2.28614 5.20038 2.18926 5.75629 2.14384C6.29336 2.09996 6.95425 2.09997 7.76228 2.09998ZM8.1 14.1V13.7623C8.09999 12.9542 8.09998 12.2934 8.14386 11.7563C8.18928 11.2004 8.28616 10.6983 8.52508 10.2294C8.89898 9.4956 9.49561 8.89898 10.2294 8.52507C10.6983 8.28616 11.2004 8.18928 11.7563 8.14386C12.2934 8.09998 12.9542 8.09999 13.7623 8.1H14.1001V7.79998C14.1001 6.94505 14.0994 6.35798 14.0622 5.90287C14.0259 5.45827 13.9593 5.21944 13.8712 5.0466C13.6699 4.65146 13.3486 4.3302 12.9535 4.12886C12.7806 4.04079 12.5418 3.97419 12.0972 3.93786C11.6421 3.90068 11.055 3.89998 10.2001 3.89998H7.79998C6.94505 3.89998 6.35798 3.90068 5.90287 3.93786C5.45827 3.97419 5.21944 4.04079 5.0466 4.12886C4.65146 4.3302 4.3302 4.65146 4.12886 5.0466C4.04079 5.21944 3.97419 5.45827 3.93786 5.90287C3.90068 6.35798 3.89998 6.94505 3.89998 7.79998V10.2C3.89998 11.0549 3.90068 11.642 3.93786 12.0971C3.97419 12.5417 4.04079 12.7805 4.12886 12.9534C4.3302 13.3485 4.65146 13.6698 5.0466 13.8711C5.21944 13.9592 5.45827 14.0258 5.90287 14.0621C6.35798 14.0993 6.94505 14.1 7.79998 14.1H8.1ZM11.0466 10.1289C11.2195 10.0408 11.4583 9.97421 11.9029 9.93788C12.358 9.9007 12.9451 9.9 13.8 9.9H16.2C17.0549 9.9 17.642 9.9007 18.0971 9.93788C18.5417 9.97421 18.7805 10.0408 18.9534 10.1289C19.3485 10.3302 19.6698 10.6515 19.8711 11.0466C19.9592 11.2195 20.0258 11.4583 20.0621 11.9029C20.0993 12.358 20.1 12.9451 20.1 13.8V16.2C20.1 17.0549 20.0993 17.642 20.0621 18.0971C20.0258 18.5417 19.9592 18.7805 19.8711 18.9534C19.6698 19.3485 19.3485 19.6698 18.9534 19.8711C18.7805 19.9592 18.5417 20.0258 18.0971 20.0621C17.642 20.0993 17.0549 20.1 16.2 20.1H13.8C12.9451 20.1 12.358 20.0993 11.9029 20.0621C11.4583 20.0258 11.2195 19.9592 11.0466 19.8711C10.6515 19.6698 10.3302 19.3485 10.1289 18.9534C10.0408 18.7805 9.97421 18.5417 9.93788 18.0971C9.9007 17.642 9.9 17.0549 9.9 16.2V13.8C9.9 12.9451 9.9007 12.358 9.93788 11.9029C9.97421 11.4583 10.0408 11.2195 10.1289 11.0466C10.3302 10.6515 10.6515 10.3302 11.0466 10.1289Z"></path></svg>`);
  const CopyIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.primary;
    return (() => {
      const _el$ = _tmpl$$7.cloneNode(true), _el$2 = _el$.firstChild;
      createRenderEffect((_p$) => {
        const _v$ = props.class, _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$, "class", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$2, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const _tmpl$$6 = /* @__PURE__ */ template$1(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.7624 3.10001C7.95435 3.1 7.29349 3.09999 6.75642 3.14387C6.2005 3.18929 5.69842 3.28617 5.22954 3.52508C4.4957 3.89899 3.89908 4.49561 3.52517 5.22944C3.28626 5.69833 3.18938 6.20041 3.14396 6.75632C3.10008 7.2934 3.10009 7.95424 3.1001 8.76229V15.2377C3.10009 16.0458 3.10008 16.7066 3.14396 17.2437C3.18938 17.7996 3.28626 18.3017 3.52517 18.7706C3.89908 19.5044 4.4957 20.101 5.22954 20.4749C5.69842 20.7138 6.2005 20.8107 6.75642 20.8561C7.29349 20.9 7.95434 20.9 8.76239 20.9H12.0001C12.4972 20.9 12.9001 20.4971 12.9001 20C12.9001 19.503 12.4972 19.1 12.0001 19.1H8.8001C7.94517 19.1 7.3581 19.0993 6.90299 19.0621C6.45839 19.0258 6.21956 18.9592 6.04672 18.8711C5.65158 18.6698 5.33032 18.3485 5.12898 17.9534C5.04092 17.7805 4.97431 17.5417 4.93798 17.0971C4.9008 16.642 4.9001 16.0549 4.9001 15.2V8.80001C4.9001 7.94508 4.9008 7.35801 4.93798 6.9029C4.97431 6.4583 5.04092 6.21947 5.12898 6.04663C5.33032 5.65149 5.65158 5.33023 6.04672 5.12889C6.21956 5.04082 6.45839 4.97422 6.90299 4.93789C7.3581 4.90071 7.94517 4.90001 8.8001 4.90001H12.0001C12.4972 4.90001 12.9001 4.49706 12.9001 4.00001C12.9001 3.50295 12.4972 3.10001 12.0001 3.10001H8.7624Z"></path><path d="M17.6364 7.3636C17.2849 7.01212 16.7151 7.01212 16.3636 7.3636C16.0121 7.71507 16.0121 8.28492 16.3636 8.63639L18.8272 11.1H9.00001C8.50295 11.1 8.10001 11.5029 8.10001 12C8.10001 12.497 8.50295 12.9 9.00001 12.9H18.8272L16.3636 15.3636C16.0121 15.7151 16.0121 16.2849 16.3636 16.6364C16.7151 16.9879 17.2849 16.9879 17.6364 16.6364L21.6364 12.6364C21.9879 12.2849 21.9879 11.7151 21.6364 11.3636L17.6364 7.3636Z"></path></svg>`);
  const DisconnectIcon = (props) => {
    const theme = useTheme();
    const fill = () => props.fill || theme.colors.icon.primary;
    return (() => {
      const _el$ = _tmpl$$6.cloneNode(true), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling;
      createRenderEffect((_p$) => {
        const _v$ = fill(), _v$2 = fill();
        _v$ !== _p$._v$ && setAttribute(_el$2, "fill", _p$._v$ = _v$);
        _v$2 !== _p$._v$2 && setAttribute(_el$3, "fill", _p$._v$2 = _v$2);
        return _p$;
      }, {
        _v$: void 0,
        _v$2: void 0
      });
      return _el$;
    })();
  };
  const hoverBorders$1 = {
    m: "8px",
    s: "4px",
    none: "0"
  };
  const dropdownBorders = {
    m: "16px",
    s: "8px",
    none: "0"
  };
  const AccountButtonDropdownStyled = styled.div`
    width: 256px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
    border-radius: ${(props) => dropdownBorders[props.theme.borderRadius]};

    background-color: ${(props) => props.theme.colors.background.primary}
           
    color: ${(props) => props.theme.colors.text.primary}
`;
  const UlStyled$1 = styled.ul`
    background-color: ${(props) => props.theme.colors.background.primary};
    padding: 8px;
`;
  const MenuButtonStyled = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding-left: 8px;
    width: 100%;

    background-color: ${(props) => props.theme.colors.background.primary};
    border: none;
    border-radius: ${(props) => hoverBorders$1[props.theme.borderRadius]};
    cursor: pointer;

    transition: background-color, transform 0.1s ease-in-out;

    &:hover {
        background-color: ${(props) => props.theme.colors.background.secondary};
    }

    &:active {
        transform: scale(0.96);
    }
`;
  const _tmpl$$5 = /* @__PURE__ */ template$1(`<li></li>`);
  const MenuItemText = (props) => createComponent(Text, {
    get translationKey() {
      return props.translationKey;
    },
    fontSize: "15px",
    fontWeight: "590",
    get children() {
      return props.children;
    }
  });
  const AccountButtonDropdown = (props) => {
    const tonConnectUi = useContext(TonConnectUiContext);
    const [isCopiedShown, setIsCopiedShown] = createSignal(false);
    const onCopy = () => __async(this, null, function* () {
      const userFriendlyAddress = sdk.toUserFriendlyAddress(tonConnectUi.account.address, tonConnectUi.account.chain === sdk.CHAIN.TESTNET);
      yield copyToClipboard(userFriendlyAddress);
      setIsCopiedShown(true);
      setTimeout(() => setIsCopiedShown(false), 1e3);
    });
    const onDisconnect = () => {
      tonConnectUi.disconnect();
      props.onClose();
    };
    return createComponent(AccountButtonDropdownStyled, {
      ref(r$) {
        const _ref$ = props.ref;
        typeof _ref$ === "function" ? _ref$(r$) : props.ref = r$;
      },
      get ["class"]() {
        return props.class;
      },
      "data-tc-dropdown": "true",
      get children() {
        return createComponent(UlStyled$1, {
          get children() {
            return [(() => {
              const _el$ = _tmpl$$5.cloneNode(true);
              insert(_el$, createComponent(MenuButtonStyled, {
                onClick: () => onCopy(),
                get children() {
                  return [createComponent(CopyIcon, {}), createComponent(Show, {
                    get when() {
                      return !isCopiedShown();
                    },
                    get children() {
                      return createComponent(MenuItemText, {
                        translationKey: "button.dropdown.copy",
                        children: "Copy address"
                      });
                    }
                  }), createComponent(Show, {
                    get when() {
                      return isCopiedShown();
                    },
                    get children() {
                      return createComponent(MenuItemText, {
                        translationKey: "button.dropdown.copied",
                        children: "Address copied!"
                      });
                    }
                  })];
                }
              }));
              return _el$;
            })(), (() => {
              const _el$2 = _tmpl$$5.cloneNode(true);
              insert(_el$2, createComponent(MenuButtonStyled, {
                onClick: () => onDisconnect(),
                get children() {
                  return [createComponent(DisconnectIcon, {}), createComponent(MenuItemText, {
                    translationKey: "button.dropdown.disconnect",
                    children: "Disconnect"
                  })];
                }
              }));
              return _el$2;
            })()];
          }
        });
      }
    });
  };
  const borders$2 = {
    m: "16px",
    s: "8px",
    none: "0"
  };
  const NotificationStyled = styled.div`
    width: 256px;
    padding: 12px 16px;
    display: flex;
    gap: 9px;

    background-color: ${(props) => props.theme.colors.background.primary};
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
    border-radius: ${(props) => borders$2[props.theme.borderRadius]};
`;
  const NotificationContentStyled = styled.div`
    width: 192px;

    > h3 {
        font-size: 15px;
    }
`;
  const TextStyled$2 = styled(Text)`
    margin-top: 4px;
    color: ${(props) => props.theme.colors.text.secondary};
`;
  const Notification = (props) => {
    const dataAttrs = useDataAttributes(props);
    return createComponent(NotificationStyled, mergeProps({
      get ["class"]() {
        return props.class;
      },
      "data-tc-notification": "true"
    }, dataAttrs, {
      get children() {
        return [createComponent(NotificationContentStyled, {
          get children() {
            return [createComponent(H3, {
              get translationKey() {
                return props.header.translationKey;
              },
              get translationValues() {
                return props.header.translationValues;
              },
              get children() {
                return props.children;
              }
            }), createComponent(Show, {
              get when() {
                return props.text;
              },
              get children() {
                return createComponent(TextStyled$2, {
                  get translationKey() {
                    return props.text.translationKey;
                  },
                  get translationValues() {
                    return props.text.translationValues;
                  }
                });
              }
            })];
          }
        }), createMemo(() => props.icon)];
      }
    }));
  };
  const LoaderIconStyled$1 = styled(LoaderIcon)`
    align-self: center;
`;
  const ConfirmOperationNotification = (props) => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [t2] = useI18n();
    const name = () => tonConnectUI.wallet && "name" in tonConnectUI.wallet ? tonConnectUI.wallet.name : t2("common.yourWallet", {}, "Your wallet");
    return createComponent(Notification, {
      get header() {
        return {
          translationKey: "notifications.confirm.header",
          translationValues: {
            name: name()
          }
        };
      },
      get ["class"]() {
        return props.class;
      },
      get icon() {
        return createComponent(LoaderIconStyled$1, {});
      },
      "data-tc-notification-confirm": "true",
      children: "Confirm operation in your wallet"
    });
  };
  const ErrorIconStyled$2 = styled(ErrorIcon)`
    margin-top: 2px;
`;
  const ErrorTransactionNotification = (props) => {
    return createComponent(Notification, {
      header: {
        translationKey: "notifications.transactionCanceled.header"
      },
      text: {
        translationKey: "notifications.transactionCanceled.text"
      },
      get icon() {
        return createComponent(ErrorIconStyled$2, {
          size: "xs"
        });
      },
      get ["class"]() {
        return props.class;
      },
      "data-tc-notification-tx-cancelled": "true",
      children: "Transaction cancelled"
    });
  };
  const SuccessIconStyled = styled(SuccessIcon)`
    margin-top: 2px;
`;
  const SuccessTransactionNotification = (props) => {
    return createComponent(Notification, {
      header: {
        translationKey: "notifications.transactionSent.header"
      },
      text: {
        translationKey: "notifications.transactionSent.text"
      },
      get icon() {
        return createComponent(SuccessIconStyled, {});
      },
      get ["class"]() {
        return props.class;
      },
      "data-tc-notification-tx-sent": "true",
      children: "Transaction sent"
    });
  };
  const NotificationClass = u`
    transform: translateY(-8px);
    margin-bottom: 12px;
`;
  const _tmpl$$4 = /* @__PURE__ */ template$1(`<div data-tc-list-notifications="true"></div>`);
  const Notifications = (props) => {
    const timeouts = [];
    const [openedNotifications, setOpenedNotifications] = createSignal([]);
    let lastId = -1;
    const liveTimeoutMs = 4500;
    createEffect(on(action, (action2) => {
      if (action2 && action2.showNotification) {
        lastId++;
        const id = lastId;
        setOpenedNotifications((notifications2) => notifications2.filter((notification) => notification.action !== "confirm-transaction").concat({
          id,
          action: action2.name
        }));
        timeouts.push(setTimeout(() => setOpenedNotifications((notifications2) => notifications2.filter((notification) => notification.id !== id)), liveTimeoutMs));
      }
    }));
    onCleanup(() => {
      timeouts.forEach(clearTimeout);
    });
    return (() => {
      const _el$ = _tmpl$$4.cloneNode(true);
      insert(_el$, createComponent(TransitionGroup, {
        onBeforeEnter: (el) => {
          el.animate([{
            opacity: 0,
            transform: "translateY(0)"
          }, {
            opacity: 1,
            transform: "translateY(-8px)"
          }], {
            duration: 200
          });
        },
        onExit: (el, done) => {
          const a2 = el.animate([{
            opacity: 1,
            transform: "translateY(-8px)"
          }, {
            opacity: 0,
            transform: "translateY(-30px)"
          }], {
            duration: 200
          });
          a2.finished.then(done);
        },
        get children() {
          return createComponent(For, {
            get each() {
              return openedNotifications();
            },
            children: (openedNotification) => createComponent(Switch, {
              get children() {
                return [createComponent(Match, {
                  get when() {
                    return openedNotification.action === "transaction-sent";
                  },
                  get children() {
                    return createComponent(SuccessTransactionNotification, {
                      "class": NotificationClass
                    });
                  }
                }), createComponent(Match, {
                  get when() {
                    return openedNotification.action === "transaction-canceled";
                  },
                  get children() {
                    return createComponent(ErrorTransactionNotification, {
                      "class": NotificationClass
                    });
                  }
                }), createComponent(Match, {
                  get when() {
                    return openedNotification.action === "confirm-transaction";
                  },
                  get children() {
                    return createComponent(ConfirmOperationNotification, {
                      "class": NotificationClass
                    });
                  }
                })];
              }
            })
          });
        }
      }));
      createRenderEffect(() => className(_el$, props.class));
      return _el$;
    })();
  };
  const AccountButtonStyled = styled(Button)`
    background-color: ${(props) => props.theme.colors.connectButton.background};
    color: ${(props) => props.theme.colors.connectButton.foreground};
    box-shadow: ${(props) => `0 4px 24px ${rgba(props.theme.colors.constant.black, 0.16)}`};
    padding: 8px 16px 8px 12px;

    display: flex;
    align-items: center;
    gap: 4px;
    height: 40px;
`;
  const DropdownButtonStyled = styled(AccountButtonStyled)`
    padding: 12px 16px;
    min-width: 148px;
    justify-content: center;
    background-color: ${(props) => props.theme.colors.background.primary};
`;
  const LoaderButtonStyled = styled(Button)`
    min-width: 148px;
    height: 40px;

    background-color: ${(props) => props.theme.colors.background.primary};
    color: ${(props) => props.theme.colors.connectButton.foreground};
    box-shadow: ${(props) => `0 4px 24px ${rgba(props.theme.colors.constant.black, 0.16)}`};

    display: flex;
    align-items: center;
    justify-content: center;
`;
  const LoaderIconStyled = styled(LoaderIcon)`
    height: 18px;
    width: 18px;
`;
  const DropdownContainerStyled = styled.div`
    width: fit-content;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;
  const DropdownStyled = styled(AccountButtonDropdown)`
    box-sizing: border-box;
    overflow: hidden;
    margin-top: 12px;
`;
  const NotificationsStyled = styled(Notifications)`
    > div:first-child {
        margin-top: 20px;
    }
`;
  function getSide(placement) {
    return placement.split("-")[0];
  }
  function getAlignment(placement) {
    return placement.split("-")[1];
  }
  function getMainAxisFromPlacement(placement) {
    return ["top", "bottom"].includes(getSide(placement)) ? "x" : "y";
  }
  function getLengthFromAxis(axis) {
    return axis === "y" ? "height" : "width";
  }
  function computeCoordsFromPlacement(_ref, placement, rtl) {
    let {
      reference,
      floating
    } = _ref;
    const commonX = reference.x + reference.width / 2 - floating.width / 2;
    const commonY = reference.y + reference.height / 2 - floating.height / 2;
    const mainAxis = getMainAxisFromPlacement(placement);
    const length = getLengthFromAxis(mainAxis);
    const commonAlign = reference[length] / 2 - floating[length] / 2;
    const side = getSide(placement);
    const isVertical = mainAxis === "x";
    let coords;
    switch (side) {
      case "top":
        coords = {
          x: commonX,
          y: reference.y - floating.height
        };
        break;
      case "bottom":
        coords = {
          x: commonX,
          y: reference.y + reference.height
        };
        break;
      case "right":
        coords = {
          x: reference.x + reference.width,
          y: commonY
        };
        break;
      case "left":
        coords = {
          x: reference.x - floating.width,
          y: commonY
        };
        break;
      default:
        coords = {
          x: reference.x,
          y: reference.y
        };
    }
    switch (getAlignment(placement)) {
      case "start":
        coords[mainAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
        break;
      case "end":
        coords[mainAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
        break;
    }
    return coords;
  }
  const computePosition$1 = (reference, floating, config) => __async(this, null, function* () {
    const {
      placement = "bottom",
      strategy = "absolute",
      middleware = [],
      platform: platform2
    } = config;
    const validMiddleware = middleware.filter(Boolean);
    const rtl = yield platform2.isRTL == null ? void 0 : platform2.isRTL(floating);
    if ({}.NODE_ENV !== "production") {
      if (platform2 == null) {
        console.error(["Floating UI: `platform` property was not passed to config. If you", "want to use Floating UI on the web, install @floating-ui/dom", "instead of the /core package. Otherwise, you can create your own", "`platform`: https://floating-ui.com/docs/platform"].join(" "));
      }
      if (validMiddleware.filter((_ref) => {
        let {
          name
        } = _ref;
        return name === "autoPlacement" || name === "flip";
      }).length > 1) {
        throw new Error(["Floating UI: duplicate `flip` and/or `autoPlacement` middleware", "detected. This will lead to an infinite loop. Ensure only one of", "either has been passed to the `middleware` array."].join(" "));
      }
      if (!reference || !floating) {
        console.error(["Floating UI: The reference and/or floating element was not defined", "when `computePosition()` was called. Ensure that both elements have", "been created and can be measured."].join(" "));
      }
    }
    let rects = yield platform2.getElementRects({
      reference,
      floating,
      strategy
    });
    let {
      x,
      y
    } = computeCoordsFromPlacement(rects, placement, rtl);
    let statefulPlacement = placement;
    let middlewareData = {};
    let resetCount = 0;
    for (let i2 = 0; i2 < validMiddleware.length; i2++) {
      const {
        name,
        fn
      } = validMiddleware[i2];
      const {
        x: nextX,
        y: nextY,
        data,
        reset
      } = yield fn({
        x,
        y,
        initialPlacement: placement,
        placement: statefulPlacement,
        strategy,
        middlewareData,
        rects,
        platform: platform2,
        elements: {
          reference,
          floating
        }
      });
      x = nextX != null ? nextX : x;
      y = nextY != null ? nextY : y;
      middlewareData = __spreadProps(__spreadValues({}, middlewareData), {
        [name]: __spreadValues(__spreadValues({}, middlewareData[name]), data)
      });
      if ({}.NODE_ENV !== "production") {
        if (resetCount > 50) {
          console.warn(["Floating UI: The middleware lifecycle appears to be running in an", "infinite loop. This is usually caused by a `reset` continually", "being returned without a break condition."].join(" "));
        }
      }
      if (reset && resetCount <= 50) {
        resetCount++;
        if (typeof reset === "object") {
          if (reset.placement) {
            statefulPlacement = reset.placement;
          }
          if (reset.rects) {
            rects = reset.rects === true ? yield platform2.getElementRects({
              reference,
              floating,
              strategy
            }) : reset.rects;
          }
          ({
            x,
            y
          } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
        }
        i2 = -1;
        continue;
      }
    }
    return {
      x,
      y,
      placement: statefulPlacement,
      strategy,
      middlewareData
    };
  });
  function rectToClientRect(rect) {
    return __spreadProps(__spreadValues({}, rect), {
      top: rect.y,
      left: rect.x,
      right: rect.x + rect.width,
      bottom: rect.y + rect.height
    });
  }
  function getWindow(node) {
    var _node$ownerDocument;
    return ((_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
  }
  function getComputedStyle$1(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeName(node) {
    return isNode(node) ? (node.nodeName || "").toLowerCase() : "";
  }
  let uaString;
  function getUAString() {
    if (uaString) {
      return uaString;
    }
    const uaData = navigator.userAgentData;
    if (uaData && Array.isArray(uaData.brands)) {
      uaString = uaData.brands.map((item) => item.brand + "/" + item.version).join(" ");
      return uaString;
    }
    return navigator.userAgent;
  }
  function isHTMLElement(value) {
    return value instanceof getWindow(value).HTMLElement;
  }
  function isElement(value) {
    return value instanceof getWindow(value).Element;
  }
  function isNode(value) {
    return value instanceof getWindow(value).Node;
  }
  function isShadowRoot(node) {
    if (typeof ShadowRoot === "undefined") {
      return false;
    }
    const OwnElement = getWindow(node).ShadowRoot;
    return node instanceof OwnElement || node instanceof ShadowRoot;
  }
  function isOverflowElement(element) {
    const {
      overflow,
      overflowX,
      overflowY,
      display
    } = getComputedStyle$1(element);
    return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
  }
  function isTableElement(element) {
    return ["table", "td", "th"].includes(getNodeName(element));
  }
  function isContainingBlock(element) {
    const isFirefox = /firefox/i.test(getUAString());
    const css = getComputedStyle$1(element);
    const backdropFilter = css.backdropFilter || css.WebkitBackdropFilter;
    return css.transform !== "none" || css.perspective !== "none" || (backdropFilter ? backdropFilter !== "none" : false) || isFirefox && css.willChange === "filter" || isFirefox && (css.filter ? css.filter !== "none" : false) || ["transform", "perspective"].some((value) => css.willChange.includes(value)) || ["paint", "layout", "strict", "content"].some(
      (value) => {
        const contain = css.contain;
        return contain != null ? contain.includes(value) : false;
      }
    );
  }
  function isLayoutViewport() {
    return !/^((?!chrome|android).)*safari/i.test(getUAString());
  }
  function isLastTraversableNode(node) {
    return ["html", "body", "#document"].includes(getNodeName(node));
  }
  const min = Math.min;
  const max = Math.max;
  const round = Math.round;
  const FALLBACK_SCALE = {
    x: 1,
    y: 1
  };
  function getScale(element) {
    const domElement = !isElement(element) && element.contextElement ? element.contextElement : isElement(element) ? element : null;
    if (!domElement) {
      return FALLBACK_SCALE;
    }
    const rect = domElement.getBoundingClientRect();
    const css = getComputedStyle$1(domElement);
    if (css.boxSizing !== "border-box") {
      if (!isHTMLElement(domElement)) {
        return FALLBACK_SCALE;
      }
      return {
        x: domElement.offsetWidth > 0 ? round(rect.width) / domElement.offsetWidth || 1 : 1,
        y: domElement.offsetHeight > 0 ? round(rect.height) / domElement.offsetHeight || 1 : 1
      };
    }
    let x = rect.width / parseFloat(css.width);
    let y = rect.height / parseFloat(css.height);
    if (!x || !Number.isFinite(x)) {
      x = 1;
    }
    if (!y || !Number.isFinite(y)) {
      y = 1;
    }
    return {
      x,
      y
    };
  }
  function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
    var _win$visualViewport$o, _win$visualViewport, _win$visualViewport$o2, _win$visualViewport2;
    if (includeScale === void 0) {
      includeScale = false;
    }
    if (isFixedStrategy === void 0) {
      isFixedStrategy = false;
    }
    const clientRect = element.getBoundingClientRect();
    let scale = FALLBACK_SCALE;
    if (includeScale) {
      if (offsetParent) {
        if (isElement(offsetParent)) {
          scale = getScale(offsetParent);
        }
      } else {
        scale = getScale(element);
      }
    }
    const win = isElement(element) ? getWindow(element) : window;
    const addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
    const x = (clientRect.left + (addVisualOffsets ? (_win$visualViewport$o = (_win$visualViewport = win.visualViewport) == null ? void 0 : _win$visualViewport.offsetLeft) != null ? _win$visualViewport$o : 0 : 0)) / scale.x;
    const y = (clientRect.top + (addVisualOffsets ? (_win$visualViewport$o2 = (_win$visualViewport2 = win.visualViewport) == null ? void 0 : _win$visualViewport2.offsetTop) != null ? _win$visualViewport$o2 : 0 : 0)) / scale.y;
    const width = clientRect.width / scale.x;
    const height = clientRect.height / scale.y;
    return {
      width,
      height,
      top: y,
      right: x + width,
      bottom: y + height,
      left: x,
      x,
      y
    };
  }
  function getDocumentElement(node) {
    return ((isNode(node) ? node.ownerDocument : node.document) || window.document).documentElement;
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
    return {
      scrollLeft: element.pageXOffset,
      scrollTop: element.pageYOffset
    };
  }
  function getWindowScrollBarX(element) {
    return getBoundingClientRect(getDocumentElement(element)).left + getNodeScroll(element).scrollLeft;
  }
  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const rect = getBoundingClientRect(element, true, strategy === "fixed", offsetParent);
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    const offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== "fixed") {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent, true);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    return {
      x: rect.left + scroll.scrollLeft - offsets.x,
      y: rect.top + scroll.scrollTop - offsets.y,
      width: rect.width,
      height: rect.height
    };
  }
  function getParentNode(node) {
    if (getNodeName(node) === "html") {
      return node;
    }
    const result = node.assignedSlot || node.parentNode || (isShadowRoot(node) ? node.host : null) || getDocumentElement(node);
    return isShadowRoot(result) ? result.host : result;
  }
  function getTrueOffsetParent(element) {
    if (!isHTMLElement(element) || getComputedStyle$1(element).position === "fixed") {
      return null;
    }
    return element.offsetParent;
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) {
        return currentNode;
      } else {
        currentNode = getParentNode(currentNode);
      }
    }
    return null;
  }
  function getOffsetParent(element) {
    const window2 = getWindow(element);
    let offsetParent = getTrueOffsetParent(element);
    while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === "static") {
      offsetParent = getTrueOffsetParent(offsetParent);
    }
    if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle$1(offsetParent).position === "static" && !isContainingBlock(offsetParent))) {
      return window2;
    }
    return offsetParent || getContainingBlock(element) || window2;
  }
  function getDimensions(element) {
    if (isHTMLElement(element)) {
      return {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    }
    const rect = getBoundingClientRect(element);
    return {
      width: rect.width,
      height: rect.height
    };
  }
  function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
    let {
      rect,
      offsetParent,
      strategy
    } = _ref;
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    if (offsetParent === documentElement) {
      return rect;
    }
    let scroll = {
      scrollLeft: 0,
      scrollTop: 0
    };
    let scale = {
      x: 1,
      y: 1
    };
    const offsets = {
      x: 0,
      y: 0
    };
    if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== "fixed") {
      if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
    };
  }
  function getViewportRect(element, strategy) {
    const win = getWindow(element);
    const html = getDocumentElement(element);
    const visualViewport = win.visualViewport;
    let width = html.clientWidth;
    let height = html.clientHeight;
    let x = 0;
    let y = 0;
    if (visualViewport) {
      width = visualViewport.width;
      height = visualViewport.height;
      const layoutViewport = isLayoutViewport();
      if (layoutViewport || !layoutViewport && strategy === "fixed") {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function getDocumentRect(element) {
    var _element$ownerDocumen;
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
    const width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
    const height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle$1(body || html).direction === "rtl") {
      x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
    }
    return {
      width,
      height,
      x,
      y
    };
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list) {
    var _node$ownerDocument;
    if (list === void 0) {
      list = [];
    }
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === ((_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.body);
    const win = getWindow(scrollableAncestor);
    if (isBody) {
      return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor));
  }
  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : {
      x: 1,
      y: 1
    };
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return {
      top: y,
      left: x,
      right: x + width,
      bottom: y + height,
      x,
      y,
      width,
      height
    };
  }
  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    if (clippingAncestor === "viewport") {
      return rectToClientRect(getViewportRect(element, strategy));
    }
    if (isElement(clippingAncestor)) {
      return getInnerBoundingClientRect(clippingAncestor, strategy);
    }
    return rectToClientRect(getDocumentRect(getDocumentElement(element)));
  }
  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element).filter((el) => isElement(el) && getNodeName(el) !== "body");
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle$1(element).position === "fixed";
    let currentNode = elementIsFixed ? getParentNode(element) : element;
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle$1(currentNode);
      const containingBlock = isContainingBlock(currentNode);
      const shouldDropCurrentNode = elementIsFixed ? !containingBlock && !currentContainingBlockComputedStyle : !containingBlock && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position);
      if (shouldDropCurrentNode) {
        result = result.filter((ancestor) => ancestor !== currentNode);
      } else {
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }
  function getClippingRect(_ref) {
    let {
      element,
      boundary,
      rootBoundary,
      strategy
    } = _ref;
    const elementClippingAncestors = boundary === "clippingAncestors" ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return {
      width: clippingRect.right - clippingRect.left,
      height: clippingRect.bottom - clippingRect.top,
      x: clippingRect.left,
      y: clippingRect.top
    };
  }
  const platform = {
    getClippingRect,
    convertOffsetParentRelativeRectToViewportRelativeRect,
    isElement,
    getDimensions,
    getOffsetParent,
    getDocumentElement,
    getScale,
    getElementRects(_ref) {
      return __async(this, null, function* () {
        let {
          reference,
          floating,
          strategy
        } = _ref;
        const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
        const getDimensionsFn = this.getDimensions;
        return {
          reference: getRectRelativeToOffsetParent(reference, yield getOffsetParentFn(floating), strategy),
          floating: __spreadValues({
            x: 0,
            y: 0
          }, yield getDimensionsFn(floating))
        };
      });
    },
    getClientRects: (element) => Array.from(element.getClientRects()),
    isRTL: (element) => getComputedStyle$1(element).direction === "rtl"
  };
  function autoUpdate(reference, floating, update, options) {
    if (options === void 0) {
      options = {};
    }
    const {
      ancestorScroll: _ancestorScroll = true,
      ancestorResize = true,
      elementResize = true,
      animationFrame = false
    } = options;
    const ancestorScroll = _ancestorScroll && !animationFrame;
    const ancestors = ancestorScroll || ancestorResize ? [...isElement(reference) ? getOverflowAncestors(reference) : reference.contextElement ? getOverflowAncestors(reference.contextElement) : [], ...getOverflowAncestors(floating)] : [];
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.addEventListener("scroll", update, {
        passive: true
      });
      ancestorResize && ancestor.addEventListener("resize", update);
    });
    let observer = null;
    if (elementResize) {
      let initialUpdate = true;
      observer = new ResizeObserver(() => {
        if (!initialUpdate) {
          update();
        }
        initialUpdate = false;
      });
      isElement(reference) && !animationFrame && observer.observe(reference);
      if (!isElement(reference) && reference.contextElement && !animationFrame) {
        observer.observe(reference.contextElement);
      }
      observer.observe(floating);
    }
    let frameId;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
    if (animationFrame) {
      frameLoop();
    }
    function frameLoop() {
      const nextRefRect = getBoundingClientRect(reference);
      if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
        update();
      }
      prevRefRect = nextRefRect;
      frameId = requestAnimationFrame(frameLoop);
    }
    update();
    return () => {
      var _observer;
      ancestors.forEach((ancestor) => {
        ancestorScroll && ancestor.removeEventListener("scroll", update);
        ancestorResize && ancestor.removeEventListener("resize", update);
      });
      (_observer = observer) == null ? void 0 : _observer.disconnect();
      observer = null;
      if (animationFrame) {
        cancelAnimationFrame(frameId);
      }
    };
  }
  const computePosition = (reference, floating, options) => {
    const cache = /* @__PURE__ */ new Map();
    const mergedOptions = __spreadValues({
      platform
    }, options);
    const platformWithCache = __spreadProps(__spreadValues({}, mergedOptions.platform), {
      _c: cache
    });
    return computePosition$1(reference, floating, __spreadProps(__spreadValues({}, mergedOptions), {
      platform: platformWithCache
    }));
  };
  function P(l2, u2, e2) {
    let c2 = () => {
      var t2;
      return (t2 = e2 == null ? void 0 : e2.placement) != null ? t2 : "bottom";
    }, d = () => {
      var t2;
      return (t2 = e2 == null ? void 0 : e2.strategy) != null ? t2 : "absolute";
    }, [n2, o2] = createSignal({ x: null, y: null, placement: c2(), strategy: d(), middlewareData: {} }), [x, F] = createSignal();
    createEffect(() => {
      let t2 = x();
      if (t2)
        throw t2.value;
    });
    let s2 = createMemo(() => (l2(), u2(), {}));
    function i2() {
      let t2 = l2(), r = u2();
      if (t2 && r) {
        let a2 = s2();
        computePosition(t2, r, { middleware: e2 == null ? void 0 : e2.middleware, placement: c2(), strategy: d() }).then((m) => {
          a2 === s2() && o2(m);
        }, (m) => {
          F(m);
        });
      }
    }
    return createEffect(() => {
      let t2 = l2(), r = u2();
      if (e2 == null || e2.middleware, c2(), d(), t2 && r)
        if (e2 != null && e2.whileElementsMounted) {
          let a2 = e2.whileElementsMounted(t2, r, i2);
          a2 && onCleanup(a2);
        } else
          i2();
    }), { get x() {
      return n2().x;
    }, get y() {
      return n2().y;
    }, get placement() {
      return n2().placement;
    }, get strategy() {
      return n2().strategy;
    }, get middlewareData() {
      return n2().middlewareData;
    }, update: i2 };
  }
  const _tmpl$$3 = /* @__PURE__ */ template$1(`<tc-root data-tc-dropdown-container="true"></tc-root>`);
  const AccountButton = () => {
    const theme = useTheme();
    const connector = useContext(ConnectorContext);
    const tonConnectUI = useContext(TonConnectUiContext);
    const [isOpened, setIsOpened] = createSignal(false);
    const [account, setAccount] = createSignal(connector.account);
    const [restoringProcess, setRestoringProcess] = createSignal(true);
    let dropDownRef;
    const [floating, setFloating] = createSignal();
    const [anchor, setAnchor] = createSignal();
    const position = P(anchor, floating, {
      whileElementsMounted: autoUpdate,
      placement: "bottom-end"
    });
    const normalizedAddress = () => {
      const acc = account();
      if (acc) {
        const userFriendlyAddress = sdk.toUserFriendlyAddress(acc.address, acc.chain === sdk.CHAIN.TESTNET);
        return userFriendlyAddress.slice(0, 4) + "\u2026" + userFriendlyAddress.slice(-4);
      }
      return "";
    };
    tonConnectUI.connectionRestored.then(() => setRestoringProcess(false));
    const unsubscribe = connector.onStatusChange((wallet) => {
      if (!wallet) {
        setIsOpened(false);
        setAccount(null);
        return;
      }
      setAccount(wallet.account);
    });
    const onClick = (e2) => {
      if (!account() || !isOpened()) {
        return;
      }
      const clickToButton = anchor().contains(e2.target);
      const clickToDropdown = dropDownRef.contains(e2.target);
      if (!clickToButton && !clickToDropdown) {
        setIsOpened(false);
      }
    };
    onMount(() => {
      document.body.addEventListener("click", onClick);
    });
    onCleanup(() => {
      document.body.removeEventListener("click", onClick);
      unsubscribe();
    });
    return createComponent(Dynamic, {
      component: globalStylesTag,
      get children() {
        return [createComponent(Show, {
          get when() {
            return restoringProcess();
          },
          get children() {
            return createComponent(LoaderButtonStyled, {
              disabled: true,
              "data-tc-connect-button-loading": "true",
              get children() {
                return createComponent(LoaderIconStyled, {});
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return !restoringProcess();
          },
          get children() {
            return [createComponent(Show, {
              get when() {
                return !account();
              },
              get children() {
                return createComponent(AccountButtonStyled, {
                  onClick: () => tonConnectUI.connectWallet(),
                  "data-tc-connect-button": "true",
                  scale: "s",
                  get children() {
                    return [createComponent(TonIcon, {
                      get fill() {
                        return theme.colors.connectButton.foreground;
                      }
                    }), createComponent(Text, {
                      translationKey: "button.connectWallet",
                      fontSize: "15px",
                      lineHeight: "18px",
                      fontWeight: "590",
                      get color() {
                        return theme.colors.connectButton.foreground;
                      },
                      children: "Connect wallet"
                    })];
                  }
                });
              }
            }), createComponent(Show, {
              get when() {
                return account();
              },
              get children() {
                return createComponent(DropdownContainerStyled, {
                  get children() {
                    return [createComponent(DropdownButtonStyled, {
                      onClick: () => setIsOpened((v) => !v),
                      ref: setAnchor,
                      "data-tc-dropdown-button": "true",
                      scale: "s",
                      get children() {
                        return [createComponent(Text, {
                          fontSize: "15px",
                          fontWeight: "590",
                          lineHeight: "18px",
                          get children() {
                            return normalizedAddress();
                          }
                        }), createComponent(ArrowIcon, {
                          direction: "bottom"
                        })];
                      }
                    }), createComponent(Portal, {
                      get children() {
                        const _el$ = untrack(() => document.importNode(_tmpl$$3, true));
                        use(setFloating, _el$);
                        _el$.style.setProperty("z-index", "999");
                        _el$._$owner = getOwner();
                        insert(_el$, createComponent(Transition, {
                          onBeforeEnter: (el) => {
                            el.animate([{
                              opacity: 0,
                              transform: "translateY(-8px)"
                            }, {
                              opacity: 1,
                              transform: "translateY(0)"
                            }], {
                              duration: 150
                            });
                          },
                          onExit: (el, done) => {
                            const a2 = el.animate([{
                              opacity: 1,
                              transform: "translateY(0)"
                            }, {
                              opacity: 0,
                              transform: "translateY(-8px)"
                            }], {
                              duration: 150
                            });
                            a2.finished.then(done);
                          },
                          get children() {
                            return createComponent(Show, {
                              get when() {
                                return isOpened();
                              },
                              get children() {
                                return createComponent(DropdownStyled, {
                                  get hidden() {
                                    return !isOpened();
                                  },
                                  onClose: () => setIsOpened(false),
                                  ref(r$) {
                                    const _ref$ = dropDownRef;
                                    typeof _ref$ === "function" ? _ref$(r$) : dropDownRef = r$;
                                  }
                                });
                              }
                            });
                          }
                        }), null);
                        insert(_el$, createComponent(NotificationsStyled, {}), null);
                        createRenderEffect((_p$) => {
                          var _a2, _b2;
                          const _v$ = position.strategy, _v$2 = `${(_a2 = position.y) != null ? _a2 : 0}px`, _v$3 = `${(_b2 = position.x) != null ? _b2 : 0}px`;
                          _v$ !== _p$._v$ && _el$.style.setProperty("position", _p$._v$ = _v$);
                          _v$2 !== _p$._v$2 && _el$.style.setProperty("top", _p$._v$2 = _v$2);
                          _v$3 !== _p$._v$3 && _el$.style.setProperty("left", _p$._v$3 = _v$3);
                          return _p$;
                        }, {
                          _v$: void 0,
                          _v$2: void 0,
                          _v$3: void 0
                        });
                        return _el$;
                      }
                    })];
                  }
                });
              }
            })];
          }
        })];
      }
    });
  };
  const StyledModal = styled(Modal)`
    padding-left: 24px;
    padding-right: 24px;
    padding-top: 18px;
    padding-bottom: 0;

    ${media("mobile")} {
        padding-left: 0;
        padding-right: 0;

        min-height: 364px;
    }
`;
  const H1Styled$8 = styled(H1)`
    margin-top: 12px;

    ${media("mobile")} {
        padding: 0 10px;
    }
`;
  const LoaderContainerStyled = styled.div`
    margin: 30px 0;
    width: 100%;
    display: flex;
    justify-content: center;

    ${media("mobile")} {
        height: 160px;
        align-items: center;
    }
`;
  styled(Text)`
    min-width: 84px;
    text-align: center;
    font-weight: 590;
`;
  styled(TabBar)`
    margin: 0 auto 22px;
`;
  const [appState, setAppState] = createStore({
    buttonRootId: null,
    language: "en",
    returnStrategy: "back",
    walletsListConfiguration: {}
  });
  function uniq(array) {
    return [...new Set(array)];
  }
  function mergeConcat(idKey, array1, array2) {
    return array1.map((item1) => {
      const item2 = array2.find((elem) => elem[idKey] === item1[idKey]);
      array2 = array2.filter((elem) => elem[idKey] !== item1[idKey]);
      return item2 === void 0 ? item1 : item2;
    }).concat(array2);
  }
  function uiWalletToWalletInfo(uiWallet) {
    if ("jsBridgeKey" in uiWallet) {
      return __spreadProps(__spreadValues({}, uiWallet), {
        injected: sdk.TonConnect.isWalletInjected(uiWallet.jsBridgeKey),
        embedded: sdk.TonConnect.isInsideWalletBrowser(uiWallet.jsBridgeKey)
      });
    }
    return uiWallet;
  }
  function applyWalletsListConfiguration(walletsList, configuration) {
    var _a2;
    if (!configuration) {
      return walletsList;
    }
    if ((_a2 = configuration.includeWallets) == null ? void 0 : _a2.length) {
      walletsList = mergeConcat(
        "name",
        walletsList,
        configuration.includeWallets.map(uiWalletToWalletInfo)
      );
    }
    return walletsList;
  }
  function supportsDesktop(walletInfo) {
    return walletInfo.platforms.some((w) => ["macos", "linux", "windows"].includes(w));
  }
  function supportsMobile(walletInfo) {
    return walletInfo.platforms.some((w) => ["ios", "android"].includes(w));
  }
  function supportsExtension(walletInfo) {
    return walletInfo.platforms.some((w) => ["chrome", "firefox", "safari"].includes(w));
  }
  function eqWalletName(wallet1, name) {
    if (!name) {
      return false;
    }
    return wallet1.name.toLowerCase() === name.toLowerCase() || wallet1.appName.toLowerCase() === name.toLowerCase();
  }
  const DesktopSelectWalletModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;
  const H1Styled$7 = styled(H1)`
    margin-bottom: 18px;
`;
  styled.div`
    height: 1px;
    margin: 0 -24px;
    width: calc(100% + 48px);
    opacity: 0.12;
    background: ${(props) => props.isShown ? props.theme.colors.icon.secondary : "transparent"};
    transition: background 0.15s ease-in-out;

    ${media("mobile")} {
        width: 100%;
    }
`;
  const WalletsUl = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, 92px);
    grid-template-rows: auto;
    align-content: flex-start;
    justify-content: center;
    row-gap: 8px;
    width: 100%;
    padding: 0 0 16px;
    align-self: flex-start;
    max-width: 400px;
    margin: 0 auto;

    > li {
        display: block;
        height: fit-content;
    }

    ${media("mobile")} {
        grid-template-columns: repeat(auto-fit, 82px);
    }
`;
  styled(Button)`
    display: block;
    margin: 0 auto 1px;
    font-size: 15px;
`;
  const StyledIconButton$3 = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;
  const WalletLabeledItemStyled = styled(WalletLabeledItem)`
    height: 100%;
`;
  const _tmpl$$2 = /* @__PURE__ */ template$1(`<li></li>`);
  const AllWalletsListModal = (props) => {
    const maxHeight = () => isMobile() ? void 0 : 510;
    const walletsList = () => isMobile() ? props.walletsList.filter(supportsMobile) : props.walletsList;
    return createComponent(DesktopSelectWalletModalStyled, {
      "data-tc-select-wallet-desktop": "true",
      get children() {
        return [createComponent(StyledIconButton$3, {
          icon: "arrow",
          onClick: () => props.onBack()
        }), createComponent(H1Styled$7, {
          translationKey: "walletModal.wallets",
          children: "Wallets"
        }), createComponent(ScrollContainer, {
          get maxHeight() {
            return maxHeight();
          },
          get children() {
            return createComponent(WalletsUl, {
              get children() {
                return createComponent(For, {
                  get each() {
                    return walletsList();
                  },
                  children: (wallet) => (() => {
                    const _el$ = _tmpl$$2.cloneNode(true);
                    insert(_el$, createComponent(WalletLabeledItemStyled, {
                      wallet,
                      onClick: () => props.onSelect(wallet)
                    }));
                    return _el$;
                  })()
                });
              }
            });
          }
        })];
      }
    });
  };
  const tgButtonBorders = {
    m: "16px",
    s: "12px",
    none: "0"
  };
  const tgIconBorders = {
    m: "6px",
    s: "6px",
    none: "0"
  };
  const DesktopConnectionModalStyled = styled.div`
    display: flex;
    flex-direction: column;
`;
  const BodyStyled$1 = styled.div`
    flex: 1;
    margin-top: ${(props) => props.qr ? "0" : "18px"};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 232px;
`;
  const QRCodeStyled$1 = styled(QRCode)`
    margin-bottom: 24px;
`;
  const H1Styled$6 = styled(H1)`
    max-width: 288px;
    margin: 0 auto 2px;
`;
  const H2Styled$4 = styled(H2)`
    max-width: 288px;
    text-align: center;
    margin: 0 auto 20px;
`;
  const StyledIconButton$2 = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;
  const ButtonsContainerStyled$1 = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-bottom: 16px;
`;
  const BottomButtonsContainerStyled = styled(ButtonsContainerStyled$1)`
    padding-bottom: 0;
`;
  const FooterButton$1 = styled(Button)`
    margin-bottom: 24px;
`;
  const LoaderStyled$1 = styled(LoaderIcon)`
    margin-bottom: 18px;
    margin-top: 2px;
`;
  const ErrorIconStyled$1 = styled(ErrorIcon)`
    margin-bottom: 16px;
`;
  const BodyTextStyled$1 = styled(H2)`
    color: ${(props) => props.theme.colors.text.secondary};
    text-align: center;
    margin-bottom: 20px;
`;
  const TgButtonStyled = styled(Button)`
    margin-top: -8px;
    margin-bottom: 24px;
    width: 100%;
    padding: 12px 12px 12px 20px;
    border-radius: ${(props) => tgButtonBorders[props.theme.borderRadius]};
    font-size: 16px;
    line-height: 20px;
`;
  const TgImageStyled = styled(Image)`
    width: 32px;
    height: 32px;
    border-radius: ${(props) => tgIconBorders[props.theme.borderRadius]};
`;
  const Translation = (props) => {
    const [t2] = useI18n();
    return createMemo(() => {
      var _a2;
      return t2(props.translationKey, props.translationValues, (_a2 = props.children) == null ? void 0 : _a2.toString());
    });
  };
  const DesktopConnectionModal = (props) => {
    const [mode, setMode] = createSignal("mobile");
    const [connectionErrored, setConnectionErrored] = createSignal(false);
    const [universalLink, setUniversalLink] = createSignal();
    const connector = useContext(ConnectorContext);
    const unsubscribe = connector.onStatusChange(() => {
    }, () => {
      if (props.wallet.appName !== AT_WALLET_APP_NAME) {
        setConnectionErrored(true);
      }
    });
    onCleanup(unsubscribe);
    const generateUniversalLink = () => {
      setUniversalLink(connector.connect({
        universalLink: props.wallet.universalLink,
        bridgeUrl: props.wallet.bridgeUrl
      }, props.additionalRequest));
    };
    createEffect(() => {
      if (untrack(mode) !== "extension" && (supportsMobile(props.wallet) || supportsDesktop(props.wallet))) {
        generateUniversalLink();
      }
    });
    const onClickMobile = () => {
      setConnectionErrored(false);
      if (mode() === "extension") {
        generateUniversalLink();
      }
      setMode("mobile");
      setLastSelectedWalletInfo(__spreadProps(__spreadValues({}, props.wallet), {
        openMethod: "qrcode"
      }));
    };
    const onClickDesktop = () => {
      setConnectionErrored(false);
      if (mode() === "extension") {
        generateUniversalLink();
      }
      setMode("desktop");
      setLastSelectedWalletInfo(__spreadProps(__spreadValues({}, props.wallet), {
        openMethod: "universal-link"
      }));
      openLinkBlank(addReturnStrategy(universalLink(), appState.returnStrategy));
    };
    const onClickTelegram = () => {
      setLastSelectedWalletInfo(__spreadProps(__spreadValues({}, props.wallet), {
        openMethod: "universal-link"
      }));
      openLinkBlank(universalLink());
    };
    const onClickExtension = () => {
      setConnectionErrored(false);
      setMode("extension");
      if (sdk.isWalletInfoCurrentlyInjected(props.wallet)) {
        setLastSelectedWalletInfo(props.wallet);
        connector.connect({
          jsBridgeKey: props.wallet.jsBridgeKey
        }, props.additionalRequest);
      }
    };
    if (supportsMobile(props.wallet)) {
      onClickMobile();
    } else if (supportsExtension(props.wallet)) {
      onClickExtension();
    } else {
      onClickDesktop();
    }
    return createComponent(DesktopConnectionModalStyled, {
      "data-tc-wallet-qr-modal-desktop": "true",
      get children() {
        return [createComponent(StyledIconButton$2, {
          icon: "arrow",
          onClick: () => props.onBackClick()
        }), createComponent(H1Styled$6, {
          get children() {
            return props.wallet.name;
          }
        }), createComponent(Show, {
          get when() {
            return mode() === "mobile";
          },
          get children() {
            return createComponent(H2Styled$4, {
              translationKey: "walletModal.desktopConnectionModal.scanQR",
              get translationValues() {
                return {
                  name: props.wallet.name
                };
              },
              get children() {
                return ["Scan the QR code below with your phone\u2019s or ", createMemo(() => props.wallet.name), "\u2019s camera"];
              }
            });
          }
        }), createComponent(BodyStyled$1, {
          get qr() {
            return mode() === "mobile";
          },
          get children() {
            return createComponent(Switch, {
              get children() {
                return [createComponent(Match, {
                  get when() {
                    return mode() === "mobile";
                  },
                  get children() {
                    return createComponent(QRCodeStyled$1, {
                      disableCopy: false,
                      get sourceUrl() {
                        return universalLink();
                      },
                      get imageUrl() {
                        return props.wallet.imageUrl;
                      }
                    });
                  }
                }), createComponent(Match, {
                  get when() {
                    return connectionErrored();
                  },
                  get children() {
                    return [createComponent(ErrorIconStyled$1, {
                      size: "s"
                    }), createComponent(BodyTextStyled$1, {
                      translationKey: "walletModal.desktopConnectionModal.connectionDeclined",
                      children: "Connection declined"
                    }), createComponent(ButtonsContainerStyled$1, {
                      get children() {
                        return createComponent(Button, {
                          get leftIcon() {
                            return createComponent(RetryIcon, {});
                          },
                          get onClick() {
                            return mode() === "extension" ? onClickExtension : onClickDesktop;
                          },
                          get children() {
                            return createComponent(Translation, {
                              translationKey: "common.retry",
                              children: "Retry"
                            });
                          }
                        });
                      }
                    })];
                  }
                }), createComponent(Match, {
                  get when() {
                    return mode() === "extension";
                  },
                  get children() {
                    return [createComponent(Show, {
                      get when() {
                        return sdk.isWalletInfoCurrentlyInjected(props.wallet);
                      },
                      get children() {
                        return [createComponent(LoaderStyled$1, {
                          size: "s"
                        }), createComponent(BodyTextStyled$1, {
                          translationKey: "walletModal.desktopConnectionModal.continueInExtension",
                          get translationValues() {
                            return {
                              name: props.wallet.name
                            };
                          },
                          get children() {
                            return ["Continue in ", createMemo(() => props.wallet.name), " browser extension\u2026"];
                          }
                        }), createComponent(ButtonsContainerStyled$1, {
                          get children() {
                            return createComponent(Button, {
                              get leftIcon() {
                                return createComponent(RetryIcon, {});
                              },
                              onClick: onClickExtension,
                              get children() {
                                return createComponent(Translation, {
                                  translationKey: "common.retry",
                                  children: "Retry"
                                });
                              }
                            });
                          }
                        })];
                      }
                    }), createComponent(Show, {
                      get when() {
                        return !sdk.isWalletInfoCurrentlyInjected(props.wallet);
                      },
                      get children() {
                        return [createComponent(BodyTextStyled$1, {
                          translationKey: "walletModal.desktopConnectionModal.dontHaveExtension",
                          get translationValues() {
                            return {
                              name: props.wallet.name
                            };
                          },
                          get children() {
                            return ["Seems you don't have installed ", createMemo(() => props.wallet.name), " browser extension"];
                          }
                        }), createComponent(ButtonsContainerStyled$1, {
                          get children() {
                            return createComponent(Link, {
                              get href() {
                                return props.wallet.aboutUrl;
                              },
                              blank: true,
                              get children() {
                                return createComponent(Button, {
                                  get rightIcon() {
                                    return createComponent(LinkIcon, {});
                                  },
                                  onClick: onClickExtension,
                                  get children() {
                                    return createComponent(Translation, {
                                      translationKey: "walletModal.desktopConnectionModal.getWallet",
                                      get translationValues() {
                                        return {
                                          name: props.wallet.name
                                        };
                                      },
                                      get children() {
                                        return ["Get ", createMemo(() => props.wallet.name)];
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        })];
                      }
                    })];
                  }
                }), createComponent(Match, {
                  get when() {
                    return mode() === "desktop";
                  },
                  get children() {
                    return [createComponent(LoaderIcon, {
                      size: "m"
                    }), createComponent(BodyTextStyled$1, {
                      translationKey: "walletModal.desktopConnectionModal.continueOnDesktop",
                      get translationValues() {
                        return {
                          name: props.wallet.name
                        };
                      },
                      get children() {
                        return ["Continue in ", createMemo(() => props.wallet.name), " on desktop\u2026"];
                      }
                    }), createComponent(ButtonsContainerStyled$1, {
                      get children() {
                        return [createComponent(Button, {
                          get leftIcon() {
                            return createComponent(RetryIcon, {});
                          },
                          onClick: onClickDesktop,
                          get children() {
                            return createComponent(Translation, {
                              translationKey: "common.retry",
                              children: "Retry"
                            });
                          }
                        }), createComponent(Link, {
                          get href() {
                            return props.wallet.aboutUrl;
                          },
                          blank: true,
                          get children() {
                            return createComponent(Button, {
                              get rightIcon() {
                                return createComponent(LinkIcon, {});
                              },
                              get children() {
                                return createComponent(Translation, {
                                  translationKey: "walletModal.desktopConnectionModal.getWallet",
                                  get translationValues() {
                                    return {
                                      name: props.wallet.name
                                    };
                                  },
                                  get children() {
                                    return ["Get ", createMemo(() => props.wallet.name)];
                                  }
                                });
                              }
                            });
                          }
                        })];
                      }
                    })];
                  }
                })];
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return props.wallet.appName === AT_WALLET_APP_NAME;
          },
          get children() {
            return createComponent(TgButtonStyled, {
              get rightIcon() {
                return createComponent(TgImageStyled, {
                  get src() {
                    return IMG.TG;
                  }
                });
              },
              scale: "s",
              onClick: onClickTelegram,
              get children() {
                return createComponent(Translation, {
                  translationKey: "walletModal.desktopConnectionModal.openWalletOnTelegram",
                  children: "Open Wallet on Telegram on desktop"
                });
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return props.wallet.appName !== AT_WALLET_APP_NAME;
          },
          get children() {
            return createComponent(BottomButtonsContainerStyled, {
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return createMemo(() => mode() !== "mobile")() && supportsMobile(props.wallet);
                  },
                  get children() {
                    return createComponent(FooterButton$1, {
                      appearance: "secondary",
                      get leftIcon() {
                        return createComponent(MobileIcon, {});
                      },
                      onClick: onClickMobile,
                      get children() {
                        return createComponent(Translation, {
                          translationKey: "common.mobile",
                          children: "Mobile"
                        });
                      }
                    });
                  }
                }), createComponent(Show, {
                  get when() {
                    return createMemo(() => mode() !== "extension")() && supportsExtension(props.wallet);
                  },
                  get children() {
                    return createComponent(FooterButton$1, {
                      appearance: "secondary",
                      get leftIcon() {
                        return createComponent(BrowserIcon, {});
                      },
                      onClick: onClickExtension,
                      get children() {
                        return createComponent(Translation, {
                          translationKey: "common.browserExtension",
                          children: "Browser Extension"
                        });
                      }
                    });
                  }
                }), createComponent(Show, {
                  get when() {
                    return createMemo(() => mode() !== "desktop")() && supportsDesktop(props.wallet);
                  },
                  get children() {
                    return createComponent(FooterButton$1, {
                      appearance: "secondary",
                      get leftIcon() {
                        return createComponent(DesktopIcon, {});
                      },
                      onClick: onClickDesktop,
                      get children() {
                        return createComponent(Translation, {
                          translationKey: "common.desktop",
                          children: "Desktop"
                        });
                      }
                    });
                  }
                })];
              }
            });
          }
        })];
      }
    });
  };
  const InfoModalStyled = styled.div``;
  const StyledIconButton$1 = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;
  const H1Styled$5 = styled(H1)`
    margin-bottom: 18px;
`;
  const InfoBlock = styled.div`
    padding: 16px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
`;
  const InfoBlockIconClass = u`
    margin-bottom: 12px;
`;
  const H3Styled = styled(H3)`
    text-align: center;
    margin-bottom: 4px;
`;
  const TextStyled$1 = styled(Text)`
    text-align: center;
    max-width: 352px;
    color: ${(props) => props.theme.colors.text.secondary};
`;
  const ButtonsBlock = styled.div`
    padding: 16px 24px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;
  const LINKS = {
    GET_A_WALLET: "https://ton.org/wallets?filters[wallet_features][slug][$in]=dapp-auth&pagination[limit]=-1"
  };
  const InfoModal = (props) => {
    return createComponent(InfoModalStyled, {
      get children() {
        return [createComponent(StyledIconButton$1, {
          icon: "arrow",
          onClick: () => props.onBackClick()
        }), createComponent(H1Styled$5, {
          translationKey: "walletModal.infoModal.whatIsAWallet",
          children: "What is a wallet"
        }), createComponent(ScrollContainer, {
          get children() {
            return [createComponent(InfoBlock, {
              get children() {
                return [createComponent(SecurityIcon, {
                  "class": InfoBlockIconClass
                }), createComponent(H3Styled, {
                  translationKey: "walletModal.infoModal.secureDigitalAssets",
                  children: "Secure digital assets storage"
                }), createComponent(TextStyled$1, {
                  translationKey: "walletModal.infoModal.walletProtects",
                  children: "A wallet protects and manages your digital assets including TON, tokens and collectables."
                })];
              }
            }), createComponent(InfoBlock, {
              get children() {
                return [createComponent(PersonalityIcon, {
                  "class": InfoBlockIconClass
                }), createComponent(H3Styled, {
                  translationKey: "walletModal.infoModal.controlIdentity",
                  children: "Control your Web3 identity"
                }), createComponent(TextStyled$1, {
                  translationKey: "walletModal.infoModal.manageIdentity",
                  children: "Manage your digital identity and access decentralized applications with ease. Maintain control over your data and engage securely in the blockchain ecosystem."
                })];
              }
            }), createComponent(InfoBlock, {
              get children() {
                return [createComponent(SwapIcon, {
                  "class": InfoBlockIconClass
                }), createComponent(H3Styled, {
                  translationKey: "walletModal.infoModal.effortlessCryptoTransactions",
                  children: "Effortless crypto transactions"
                }), createComponent(TextStyled$1, {
                  translationKey: "walletModal.infoModal.easilySend",
                  children: "Easily send, receive, monitor your cryptocurrencies. Streamline your operations with decentralized applications."
                })];
              }
            }), createComponent(ButtonsBlock, {
              get children() {
                return createComponent(Link, {
                  get href() {
                    return LINKS.GET_A_WALLET;
                  },
                  blank: true,
                  get children() {
                    return createComponent(Button, {
                      get rightIcon() {
                        return createComponent(WalletIcon, {});
                      },
                      get children() {
                        return createComponent(Translation, {
                          translationKey: "walletModal.infoModal.getAWallet",
                          children: "Get a Wallet"
                        });
                      }
                    });
                  }
                });
              }
            })];
          }
        })];
      }
    });
  };
  const MobileConnectionModalStyled = styled.div``;
  const BodyStyled = styled.div`
    flex: 1;
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 232px;
`;
  const H1Styled$4 = styled(H1)`
    max-width: 262px;
    margin: 0 auto 8px;
`;
  const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;
  const FooterStyled = styled.div`
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-top: 0.5px solid ${(props) => rgba(props.theme.colors.icon.secondary, 0.2)};
`;
  const ImageStyled = styled(Image)`
    width: 36px;
    height: 36px;
    border-radius: 10px;
`;
  const FooterButton = styled(Link)`
    margin-left: auto;
`;
  const LoaderStyled = styled(LoaderIcon)`
    margin-bottom: 18px;
    margin-top: 2px;
`;
  const ErrorIconStyled = styled(ErrorIcon)`
    margin-bottom: 16px;
`;
  const BodyTextStyled = styled(H2)`
    color: ${(props) => props.theme.colors.text.secondary};
    text-align: center;
    margin-bottom: 20px;
`;
  const ButtonsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-bottom: 16px;
`;
  const H1Styled$3 = styled(H1)`
    margin-bottom: 2px;
    padding: 0 64px;
`;
  const H2Styled$3 = styled(H2)`
    margin-bottom: 20px;
    padding: 0 64px;
    min-height: 44px;
`;
  const QrCodeWrapper$1 = styled.div`
    padding: 0 24px 24px;
`;
  const MobileConnectionQR = (props) => {
    return [createComponent(H1Styled$3, {
      get children() {
        return props.walletInfo.name;
      }
    }), createComponent(H2Styled$3, {
      translationKey: "walletModal.mobileConnectionModal.scanQR",
      get translationValues() {
        return {
          name: props.walletInfo.name
        };
      },
      get children() {
        return ["Scan the QR code below with your phone\u2019s or ", createMemo(() => props.walletInfo.name), "\u2019s camera"];
      }
    }), createComponent(QrCodeWrapper$1, {
      get children() {
        return createComponent(QRCode, {
          get imageUrl() {
            return props.walletInfo.imageUrl;
          },
          get sourceUrl() {
            return props.universalLink;
          },
          disableCopy: true
        });
      }
    })];
  };
  const MobileConnectionModal = (props) => {
    const theme = useTheme();
    const [showQR, setShowQR] = createSignal(false);
    const [connectionErrored, setConnectionErrored] = createSignal(false);
    const connector = useContext(ConnectorContext);
    const unsubscribe = connector.onStatusChange(() => {
    }, () => {
      setConnectionErrored(true);
    });
    const universalLink = createMemo(() => connector.connect({
      universalLink: props.wallet.universalLink,
      bridgeUrl: props.wallet.bridgeUrl
    }, props.additionalRequest));
    const onRetry = () => {
      setConnectionErrored(false);
      setLastSelectedWalletInfo(__spreadProps(__spreadValues({}, props.wallet), {
        openMethod: "universal-link"
      }));
      openLinkBlank(addReturnStrategy(universalLink(), appState.returnStrategy));
    };
    const onOpenQR = () => {
      setConnectionErrored(false);
      setShowQR(true);
      setLastSelectedWalletInfo(__spreadProps(__spreadValues({}, props.wallet), {
        openMethod: "qrcode"
      }));
    };
    const onCloseQR = () => {
      setShowQR(false);
      setLastSelectedWalletInfo(__spreadProps(__spreadValues({}, props.wallet), {
        openMethod: "universal-link"
      }));
    };
    const onBack = () => {
      if (showQR()) {
        onCloseQR();
      } else {
        props.onBackClick();
      }
    };
    onCleanup(unsubscribe);
    onRetry();
    return createComponent(MobileConnectionModalStyled, {
      "data-tc-wallet-qr-modal-desktop": "true",
      get children() {
        return [createComponent(StyledIconButton, {
          icon: "arrow",
          onClick: onBack
        }), createComponent(Show, {
          get when() {
            return showQR();
          },
          get children() {
            return createComponent(MobileConnectionQR, {
              get universalLink() {
                return universalLink();
              },
              get walletInfo() {
                return props.wallet;
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return !showQR();
          },
          get children() {
            return [createComponent(H1Styled$4, {
              get children() {
                return props.wallet.name;
              }
            }), createComponent(BodyStyled, {
              get children() {
                return [createComponent(Show, {
                  get when() {
                    return connectionErrored();
                  },
                  get children() {
                    return [createComponent(ErrorIconStyled, {
                      size: "s"
                    }), createComponent(BodyTextStyled, {
                      translationKey: "walletModal.mobileConnectionModal.connectionDeclined",
                      children: "Connection declined"
                    }), createComponent(ButtonsContainerStyled, {
                      get children() {
                        return [createComponent(Button, {
                          get leftIcon() {
                            return createComponent(RetryIcon, {});
                          },
                          onClick: onRetry,
                          get children() {
                            return createComponent(Translation, {
                              translationKey: "common.retry",
                              children: "Retry"
                            });
                          }
                        }), createComponent(Button, {
                          get leftIcon() {
                            return createComponent(QRIcon, {
                              get fill() {
                                return theme.colors.accent;
                              }
                            });
                          },
                          onClick: onOpenQR,
                          get children() {
                            return createComponent(Translation, {
                              translationKey: "walletModal.mobileConnectionModal.showQR",
                              children: "Show QR Code"
                            });
                          }
                        })];
                      }
                    })];
                  }
                }), createComponent(Show, {
                  get when() {
                    return !connectionErrored();
                  },
                  get children() {
                    return [createComponent(LoaderStyled, {
                      size: "s"
                    }), createComponent(BodyTextStyled, {
                      translationKey: "walletModal.mobileConnectionModal.continueIn",
                      get translationValues() {
                        return {
                          name: props.wallet.name
                        };
                      },
                      get children() {
                        return ["Continue in ", createMemo(() => props.wallet.name), "\u2026"];
                      }
                    }), createComponent(ButtonsContainerStyled, {
                      get children() {
                        return [createComponent(Button, {
                          get leftIcon() {
                            return createComponent(RetryIcon, {});
                          },
                          onClick: onRetry,
                          get children() {
                            return createComponent(Translation, {
                              translationKey: "common.retry",
                              children: "Retry"
                            });
                          }
                        }), createComponent(Button, {
                          get leftIcon() {
                            return createComponent(QRIcon, {
                              get fill() {
                                return theme.colors.accent;
                              }
                            });
                          },
                          onClick: onOpenQR,
                          get children() {
                            return createComponent(Translation, {
                              translationKey: "walletModal.mobileConnectionModal.showQR",
                              children: "Show QR Code"
                            });
                          }
                        })];
                      }
                    })];
                  }
                })];
              }
            }), createComponent(FooterStyled, {
              get children() {
                return [createComponent(ImageStyled, {
                  get src() {
                    return props.wallet.imageUrl;
                  }
                }), createComponent(H3, {
                  get children() {
                    return props.wallet.name;
                  }
                }), createComponent(FooterButton, {
                  get href() {
                    return props.wallet.aboutUrl;
                  },
                  blank: true,
                  get children() {
                    return createComponent(Button, {
                      get children() {
                        return createComponent(Translation, {
                          translationKey: "common.get",
                          children: "GET"
                        });
                      }
                    });
                  }
                })];
              }
            })];
          }
        })];
      }
    });
  };
  const borders$1 = {
    m: "16px",
    s: "12px",
    none: "0"
  };
  const tgBorders = {
    m: "6px",
    s: "6px",
    none: "0"
  };
  const UlStyled = styled.ul`
    display: flex;
    justify-content: space-between;
    margin: 0 auto;
    width: fit-content;
    max-width: 100%;
    min-width: 100%;
    height: fit-content;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 0 13px 24px;

    &&::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    > li {
        height: fit-content;
    }
`;
  const OtherOptionButton = styled.li`
    width: 82px;
    min-width: 82px;
    height: 124px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;

    text-align: center;
    cursor: pointer;

    transition: transform 0.1s ease-in-out;

    ${mediaNotTouch} {
        &:hover {
            transform: scale(1.04);
        }
    }

    &:active {
        transform: scale(0.96);
    }

    ${mediaTouch} {
        &:active {
            transform: scale(0.92);
        }
    }
`;
  const Divider = styled.div`
    width: 1px;
    margin: 0 10px;
    height: 24px;
    position: relative;
    top: 26px;

    background-color: ${(props) => props.theme.colors.icon.secondary};
    opacity: 0.2;
`;
  const IconContainer = styled.div`
    width: 60px;
    height: 60px;
    border-radius: ${(props) => borders$1[props.theme.borderRadius]};
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${(props) => props.theme.colors.background.tint};
    margin-bottom: 8px;
`;
  const H1Styled$2 = styled(H1)`
    margin-top: 38px;
    margin-bottom: 4px;
    padding: 0 24px;
`;
  const H2Styled$2 = styled(H2)`
    margin-bottom: 24px;
    padding: 0 24px;
    min-height: 44px;
`;
  styled(Button)`
    display: block;
    margin: 0 auto;
`;
  const TelegramButtonStyled = styled(Button)`
    margin: 0 24px 24px;
    width: calc(100% - 48px);
    border-radius: ${(props) => borders$1[props.theme.borderRadius]};
    padding: 14px 16px 14px 14px;
    background-color: ${(props) => props.theme.colors.telegramButton};

    color: ${(props) => props.theme.colors.constant.white};
    font-weight: 590;
    font-size: 16px;
    line-height: 20px;
`;
  const TGImageStyled = styled(Image)`
    border-radius: ${(props) => tgBorders[props.theme.borderRadius]};
    width: 24px;
    height: 24px;
`;
  const StyledLeftActionButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;
  const H1Styled$1 = styled(H1)`
    margin-bottom: 2px;
    padding: 0 64px;
`;
  const H2Styled$1 = styled(H2)`
    margin-bottom: 20px;
    padding: 0 64px;
`;
  const QrCodeWrapper = styled.div`
    padding: 0 24px 24px;
`;
  const MobileUniversalQR = (props) => {
    return [createComponent(H1Styled$1, {
      translationKey: "walletModal.mobileUniversalModal.connectYourWallet",
      children: "Connect your wallet"
    }), createComponent(H2Styled$1, {
      translationKey: "walletModal.mobileUniversalModal.scan",
      children: "Scan with your mobile wallet"
    }), createComponent(QrCodeWrapper, {
      get children() {
        return createComponent(QRCode, {
          get imageUrl() {
            return IMG.TON;
          },
          get sourceUrl() {
            return props.universalLink;
          },
          disableCopy: true
        });
      }
    })];
  };
  const _tmpl$$1 = /* @__PURE__ */ template$1(`<li></li>`), _tmpl$2 = /* @__PURE__ */ template$1(`<div data-tc-wallets-modal-mobile="true"></div>`);
  const MobileUniversalModal = (props) => {
    const [showQR, setShowQR] = createSignal(false);
    const connector = appState.connector;
    const walletsList = () => props.walletsList.filter((w) => supportsMobile(w) && w.appName !== AT_WALLET_APP_NAME);
    const shouldShowMoreButton = () => walletsList().length > 7;
    const universalLink = createMemo(() => connector.connect(props.walletsList.filter(sdk.isWalletInfoRemote).map((item) => ({
      bridgeUrl: item.bridgeUrl,
      universalLink: item.universalLink
    })), props.additionalRequest));
    setLastSelectedWalletInfo({
      openMethod: "universal-link"
    });
    const [isCopiedShown, setIsCopiedShown] = createSignal(void 0);
    const onCopy = () => __async(this, null, function* () {
      if (isCopiedShown() !== void 0) {
        clearTimeout(isCopiedShown());
      }
      yield copyToClipboard(universalLink());
      const timeoutId = setTimeout(() => setIsCopiedShown(void 0), 1500);
      setIsCopiedShown(timeoutId);
    });
    const onSelectUniversal = () => {
      openLinkBlank(addReturnStrategy(universalLink(), appState.returnStrategy));
    };
    const onSelectTelegram = () => {
      const atWallet = props.walletsList.find((wallet) => wallet.appName === AT_WALLET_APP_NAME);
      if (!atWallet || !sdk.isWalletInfoRemote(atWallet)) {
        throw new TonConnectUIError("@wallet bot not found in the wallets list");
      }
      const walletLink = connector.connect({
        bridgeUrl: atWallet.bridgeUrl,
        universalLink: atWallet.universalLink
      }, props.additionalRequest);
      openLinkBlank(walletLink);
    };
    const onOpenQR = () => {
      setShowQR(true);
      setLastSelectedWalletInfo({
        openMethod: "qrcode"
      });
    };
    const onCloseQR = () => {
      setShowQR(false);
      setLastSelectedWalletInfo({
        openMethod: "universal-link"
      });
    };
    return (() => {
      const _el$ = _tmpl$2.cloneNode(true);
      insert(_el$, createComponent(Show, {
        get when() {
          return showQR();
        },
        get children() {
          return [createComponent(StyledLeftActionButton, {
            icon: "arrow",
            onClick: onCloseQR
          }), createComponent(MobileUniversalQR, {
            get universalLink() {
              return universalLink();
            }
          })];
        }
      }), null);
      insert(_el$, createComponent(Show, {
        get when() {
          return !showQR();
        },
        get children() {
          return [createComponent(StyledLeftActionButton, {
            get icon() {
              return createComponent(QRIcon, {});
            },
            onClick: onOpenQR
          }), createComponent(H1Styled$2, {
            translationKey: "walletModal.mobileUniversalModal.connectYourWallet",
            children: "Connect your wallet"
          }), createComponent(H2Styled$2, {
            translationKey: "walletModal.mobileUniversalModal.openWalletOnTelegramOrSelect",
            children: "Open Wallet on Telegram or select your wallet to connect"
          }), createComponent(TelegramButtonStyled, {
            get leftIcon() {
              return createComponent(AtWalletIcon, {});
            },
            get rightIcon() {
              return createComponent(TGImageStyled, {
                get src() {
                  return IMG.TG;
                }
              });
            },
            onClick: onSelectTelegram,
            scale: "s",
            get children() {
              return createComponent(Translation, {
                translationKey: "walletModal.mobileUniversalModal.openWalletOnTelegram",
                children: "Open Wallet on Telegram"
              });
            }
          }), createComponent(UlStyled, {
            get children() {
              return [createComponent(For, {
                get each() {
                  return createMemo(() => !!shouldShowMoreButton())() ? walletsList().slice(0, 4) : walletsList();
                },
                children: (wallet) => (() => {
                  const _el$3 = _tmpl$$1.cloneNode(true);
                  insert(_el$3, createComponent(WalletItem, {
                    get icon() {
                      return wallet.imageUrl;
                    },
                    get name() {
                      return wallet.name;
                    },
                    onClick: () => props.onSelect(wallet)
                  }));
                  return _el$3;
                })()
              }), createComponent(Show, {
                get when() {
                  return shouldShowMoreButton();
                },
                get children() {
                  const _el$2 = _tmpl$$1.cloneNode(true);
                  insert(_el$2, createComponent(FourWalletsItem, {
                    labelLine1: "View all",
                    labelLine2: "wallets",
                    get images() {
                      return walletsList().slice(3, 7).map((i2) => i2.imageUrl);
                    },
                    onClick: () => props.onSelectAllWallets()
                  }));
                  return _el$2;
                }
              }), createComponent(Divider, {
                children: "\xA0"
              }), createComponent(OtherOptionButton, {
                onClick: onSelectUniversal,
                get children() {
                  return [createComponent(IconContainer, {
                    get children() {
                      return createComponent(LongArrowIcon, {});
                    }
                  }), createComponent(Text, {
                    fontWeight: 590,
                    translationKey: "walletModal.mobileUniversalModal.openLink",
                    children: "Open Link"
                  })];
                }
              }), createComponent(OtherOptionButton, {
                onClick: onCopy,
                get children() {
                  return [createComponent(IconContainer, {
                    get children() {
                      return createMemo(() => isCopiedShown() !== void 0)() ? createComponent(DoneIcon, {}) : createComponent(CopyLightIcon, {});
                    }
                  }), createComponent(Text, {
                    fontWeight: 590,
                    get translationKey() {
                      return isCopiedShown() !== void 0 ? "common.copied" : "common.copyLink";
                    },
                    get children() {
                      return isCopiedShown() !== void 0 ? "Copied" : "Copy Link";
                    }
                  })];
                }
              })];
            }
          })];
        }
      }), null);
      return _el$;
    })();
  };
  const borders = {
    m: "16px",
    s: "8px",
    none: "0"
  };
  const hoverBorders = {
    m: "8px",
    s: "4px",
    none: "0"
  };
  const DesktopUniversalModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 16px;
`;
  const H2Styled = styled(H2)`
    max-width: 320px;
    margin-top: 2px;
    margin-bottom: 20px;
`;
  const H2AvailableWalletsStyled = styled(H2)`
    margin-bottom: 16px;
`;
  const QRCodeStyled = styled(QRCode)`
    margin-bottom: 24px;
`;
  const WalletsContainerStyled = styled.ul`
    display: flex;
`;
  styled.div`
    display: flex;
    gap: 16px;
    width: 100%;
`;
  styled(Button)`
    position: relative;
    font-size: 16px;
    line-height: 20px;
    width: 100%;
    padding: 0 16px;
    height: 56px;
    border-radius: ${(props) => borders[props.theme.borderRadius]};

    &:hover {
        ${(props) => props.disableEventsAnimation ? "transform: unset;" : ""}
    }

    &:active {
        ${(props) => props.disableEventsAnimation ? "transform: unset;" : ""}
    }
`;
  styled.ul`
    position: absolute;
    bottom: 100%;
    left: 0;
    margin: 0;
    padding: 8px;
    width: 188px;
    transform: translateY(-16px);

    background-color: ${(props) => props.theme.colors.background.primary};
    border-radius: ${(props) => borders[props.theme.borderRadius]};
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.16);
`;
  styled.li`
    padding: 8px;

    display: flex;
    align-items: center;
    gap: 8px;

    cursor: pointer;
    border-radius: ${(props) => hoverBorders[props.theme.borderRadius]};

    transition: background-color, transform 0.1s ease-in-out;

    &:hover {
        background-color: ${(props) => props.theme.colors.background.secondary};
    }

    &:active {
        transform: scale(0.96);
    }
`;
  styled(Image)`
    width: 24px;
    height: 24px;

    border-radius: 6px;
`;
  styled.div`
    margin-top: 23px;
    margin-bottom: 1px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;
  styled(Text)`
    color: ${(props) => props.theme.colors.text.secondary};
    font-size: 16px;
`;
  const _tmpl$ = /* @__PURE__ */ template$1(`<li></li>`);
  const DesktopUniversalModal = (props) => {
    const [popupOpened, setPopupOpened] = createSignal(false);
    const connector = appState.connector;
    const walletsBridges = props.walletsList.filter(sdk.isWalletInfoRemote).map((item) => ({
      bridgeUrl: item.bridgeUrl,
      universalLink: item.universalLink
    }));
    setLastSelectedWalletInfo({
      openMethod: "qrcode"
    });
    const request = createMemo(() => connector.connect(walletsBridges, props.additionalRequest));
    return createComponent(DesktopUniversalModalStyled, {
      onClick: () => setPopupOpened(false),
      "data-tc-universal-qr-desktop": "true",
      get children() {
        return [createComponent(H1, {
          translationKey: "walletModal.desktopUniversalModal.connectYourWallet",
          children: "Connect your wallet"
        }), createComponent(H2Styled, {
          translationKey: "walletModal.desktopUniversalModal.scan",
          children: "Scan with your mobile wallet"
        }), createComponent(QRCodeStyled, {
          get sourceUrl() {
            return request();
          },
          get disableCopy() {
            return popupOpened();
          },
          get imageUrl() {
            return IMG.TON;
          }
        }), createComponent(H2AvailableWalletsStyled, {
          translationKey: "walletModal.desktopUniversalModal.availableWallets",
          children: "Available wallets"
        }), createComponent(WalletsContainerStyled, {
          get children() {
            return [createComponent(For, {
              get each() {
                return props.walletsList.slice(0, 3);
              },
              children: (wallet) => (() => {
                const _el$ = _tmpl$.cloneNode(true);
                insert(_el$, createComponent(WalletLabeledItem, {
                  wallet,
                  onClick: () => props.onSelect(wallet)
                }));
                return _el$;
              })()
            }), createComponent(FourWalletsItem, {
              labelLine1: "View all",
              labelLine2: "wallets",
              get images() {
                return props.walletsList.slice(3, 7).map((i2) => i2.imageUrl);
              },
              onClick: () => props.onSelectAllWallets()
            })];
          }
        })];
      }
    });
  };
  const WalletsModal = () => {
    const {
      locale
    } = useI18n()[1];
    createEffect(() => locale(appState.language));
    const connector = useContext(ConnectorContext);
    const tonConnectUI = useContext(TonConnectUiContext);
    const [fetchedWalletsList] = createResource(() => tonConnectUI.getWallets());
    const [selectedWalletInfo, setSelectedWalletInfo] = createSignal(null);
    const [selectedTab, setSelectedTab] = createSignal("universal");
    const [infoTab, setInfoTab] = createSignal(false);
    const walletsList = createMemo(() => {
      if (fetchedWalletsList.state !== "ready") {
        return null;
      }
      let walletsList2 = applyWalletsListConfiguration(fetchedWalletsList(), appState.walletsListConfiguration);
      const injectedWallets = walletsList2.filter(sdk.isWalletInfoCurrentlyInjected);
      const notInjectedWallets = walletsList2.filter((w) => !sdk.isWalletInfoCurrentlyInjected(w));
      walletsList2 = (injectedWallets || []).concat(notInjectedWallets);
      const preferredWalletAppName = appState.preferredWalletAppName;
      const preferredWallet = walletsList2.find((item) => eqWalletName(item, preferredWalletAppName));
      const someWalletsWithSameName = walletsList2.filter((item) => eqWalletName(item, preferredWalletAppName)).length >= 2;
      if (preferredWalletAppName && preferredWallet && !someWalletsWithSameName) {
        walletsList2 = [__spreadProps(__spreadValues({}, preferredWallet), {
          isPreferred: true
        })].concat(walletsList2.filter((item) => !eqWalletName(item, preferredWalletAppName)));
      }
      const atWallet = walletsList2.find((item) => eqWalletName(item, AT_WALLET_APP_NAME));
      if (atWallet) {
        walletsList2 = [atWallet].concat(walletsList2.filter((item) => !eqWalletName(item, AT_WALLET_APP_NAME)));
      }
      return walletsList2;
    });
    const additionalRequestLoading = () => {
      var _a2;
      return ((_a2 = appState.connectRequestParameters) == null ? void 0 : _a2.state) === "loading";
    };
    const additionalRequest = createMemo(() => {
      var _a2;
      if (additionalRequestLoading()) {
        return void 0;
      }
      return (_a2 = appState.connectRequestParameters) == null ? void 0 : _a2.value;
    });
    const onClose = () => {
      setWalletsModalOpen(false);
      setSelectedWalletInfo(null);
      setInfoTab(false);
    };
    const unsubscribe = connector.onStatusChange((wallet) => {
      if (wallet) {
        onClose();
      }
    });
    onCleanup(unsubscribe);
    return createComponent(StyledModal, {
      get opened() {
        return walletsModalOpen();
      },
      onClose,
      onClickQuestion: () => setInfoTab((v) => !v),
      "data-tc-wallets-modal-container": "true",
      get children() {
        return [createComponent(Show, {
          get when() {
            return infoTab();
          },
          get children() {
            return createComponent(InfoModal, {
              onBackClick: () => setInfoTab(false)
            });
          }
        }), createComponent(Show, {
          get when() {
            return !infoTab();
          },
          get children() {
            return [createComponent(Show, {
              get when() {
                return additionalRequestLoading() || !walletsList();
              },
              get children() {
                return [createComponent(H1Styled$8, {
                  translationKey: "walletModal.loading",
                  children: "Wallets list is loading"
                }), createComponent(LoaderContainerStyled, {
                  get children() {
                    return createComponent(LoaderIcon, {
                      size: "m"
                    });
                  }
                })];
              }
            }), createComponent(Show, {
              get when() {
                return createMemo(() => !!!additionalRequestLoading())() && walletsList();
              },
              get children() {
                return createComponent(Switch, {
                  get children() {
                    return [createComponent(Match, {
                      get when() {
                        return selectedWalletInfo();
                      },
                      get children() {
                        return createComponent(Dynamic, {
                          get component() {
                            return isMobile() ? MobileConnectionModal : DesktopConnectionModal;
                          },
                          get wallet() {
                            return selectedWalletInfo();
                          },
                          get additionalRequest() {
                            return additionalRequest();
                          },
                          onBackClick: () => setSelectedWalletInfo(null)
                        });
                      }
                    }), createComponent(Match, {
                      get when() {
                        return selectedTab() === "universal";
                      },
                      get children() {
                        return createComponent(Dynamic, {
                          get component() {
                            return isMobile() ? MobileUniversalModal : DesktopUniversalModal;
                          },
                          onSelect: setSelectedWalletInfo,
                          get walletsList() {
                            return walletsList();
                          },
                          get additionalRequest() {
                            return additionalRequest();
                          },
                          onSelectAllWallets: () => setSelectedTab("all-wallets")
                        });
                      }
                    }), createComponent(Match, {
                      get when() {
                        return selectedTab() === "all-wallets";
                      },
                      get children() {
                        return createComponent(AllWalletsListModal, {
                          get walletsList() {
                            return walletsList();
                          },
                          onBack: () => setSelectedTab("universal"),
                          onSelect: setSelectedWalletInfo
                        });
                      }
                    })];
                  }
                });
              }
            })];
          }
        })];
      }
    });
  };
  const ActionModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 8px;
`;
  const H1Styled = styled(H1)`
    margin-top: 16px;
`;
  const TextStyled = styled(Text)`
    font-weight: 510;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    max-width: 250px;

    color: ${(props) => props.theme.colors.text.secondary};
`;
  const ButtonStyled = styled(Button)`
    margin-top: 32px;
`;
  const ActionModal = (props) => {
    const dataAttrs = useDataAttributes(props);
    const tonConnectUI = useContext(TonConnectUiContext);
    let universalLink;
    if ((tonConnectUI == null ? void 0 : tonConnectUI.wallet) && "universalLink" in tonConnectUI.wallet && tonConnectUI.wallet.openMethod === "universal-link") {
      universalLink = tonConnectUI.wallet.universalLink;
    }
    const onOpenWallet = () => {
      openLink(addReturnStrategy(universalLink, "back"));
    };
    return createComponent(ActionModalStyled, mergeProps(dataAttrs, {
      get children() {
        return [createMemo(() => props.icon), createComponent(H1Styled, {
          get translationKey() {
            return props.headerTranslationKey;
          },
          get translationValues() {
            return props.headerTranslationValues;
          }
        }), createComponent(TextStyled, {
          get translationKey() {
            return props.textTranslationKey;
          },
          get translationValues() {
            return props.textTranslationValues;
          }
        }), createComponent(Show, {
          get when() {
            return props.showButton !== "open-wallet";
          },
          get children() {
            return createComponent(ButtonStyled, {
              onClick: () => props.onClose(),
              get children() {
                return createComponent(Translation, {
                  translationKey: "common.close",
                  children: "Close"
                });
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return props.showButton === "open-wallet" && universalLink;
          },
          get children() {
            return createComponent(ButtonStyled, {
              onClick: onOpenWallet,
              get children() {
                return createComponent(Translation, {
                  translationKey: "common.openWallet",
                  children: "Open wallet"
                });
              }
            });
          }
        })];
      }
    }));
  };
  const ConfirmTransactionModal = (props) => {
    const tonConnectUI = useContext(TonConnectUiContext);
    const [t2] = useI18n();
    const name = () => tonConnectUI.wallet && "name" in tonConnectUI.wallet ? tonConnectUI.wallet.name : t2("common.yourWallet", {}, "Your wallet");
    return createComponent(ActionModal, {
      headerTranslationKey: "actionModal.confirmTransaction.header",
      get headerTranslationValues() {
        return {
          name: name()
        };
      },
      textTranslationKey: "actionModal.confirmTransaction.text",
      get icon() {
        return createComponent(LoaderIcon, {
          size: "m"
        });
      },
      onClose: () => props.onClose(),
      showButton: "open-wallet",
      "data-tc-confirm-modal": "true"
    });
  };
  const TransactionCanceledModal = (props) => {
    return createComponent(ActionModal, {
      headerTranslationKey: "actionModal.transactionCanceled.header",
      textTranslationKey: "actionModal.transactionCanceled.text",
      get icon() {
        return createComponent(ErrorIcon, {
          size: "m"
        });
      },
      onClose: () => props.onClose(),
      "data-tc-transaction-canceled-modal": "true"
    });
  };
  const TransactionSentModal = (props) => {
    return createComponent(ActionModal, {
      headerTranslationKey: "actionModal.transactionSent.header",
      textTranslationKey: "actionModal.transactionSent.text",
      get icon() {
        return createComponent(SuccessIcon, {
          size: "m"
        });
      },
      onClose: () => props.onClose(),
      "data-tc-transaction-sent-modal": "true"
    });
  };
  const ActionsModal = () => {
    return createComponent(Modal, {
      get opened() {
        var _a2;
        return createMemo(() => action() !== null)() && ((_a2 = action()) == null ? void 0 : _a2.openModal) === true;
      },
      onClose: () => setAction(null),
      "data-tc-actions-modal-container": "true",
      get children() {
        return createComponent(Switch, {
          get children() {
            return [createComponent(Match, {
              get when() {
                return action().name === "transaction-sent";
              },
              get children() {
                return createComponent(TransactionSentModal, {
                  onClose: () => setAction(null)
                });
              }
            }), createComponent(Match, {
              get when() {
                return action().name === "transaction-canceled";
              },
              get children() {
                return createComponent(TransactionCanceledModal, {
                  onClose: () => setAction(null)
                });
              }
            }), createComponent(Match, {
              get when() {
                return action().name === "confirm-transaction";
              },
              get children() {
                return createComponent(ConfirmTransactionModal, {
                  onClose: () => setAction(null)
                });
              }
            })];
          }
        });
      }
    });
  };
  const App = (props) => {
    const translations = createI18nContext(i18nDictionary, appState.language);
    defineStylesRoot();
    fixMobileSafariActiveTransition();
    return createComponent(I18nContext.Provider, {
      value: translations,
      get children() {
        return createComponent(TonConnectUiContext.Provider, {
          get value() {
            return props.tonConnectUI;
          },
          get children() {
            return createComponent(ConnectorContext.Provider, {
              get value() {
                return appState.connector;
              },
              get children() {
                return [createComponent(GlobalStyles, {}), createComponent(ThemeProvider, {
                  theme: themeState,
                  get children() {
                    return [createComponent(Show, {
                      get when() {
                        return appState.buttonRootId;
                      },
                      get children() {
                        return createComponent(Portal, {
                          get mount() {
                            return document.getElementById(appState.buttonRootId);
                          },
                          get children() {
                            return createComponent(AccountButton, {});
                          }
                        });
                      }
                    }), createComponent(Dynamic, {
                      component: globalStylesTag,
                      get children() {
                        return [createComponent(WalletsModal, {}), createComponent(ActionsModal, {})];
                      }
                    })];
                  }
                })];
              }
            });
          }
        });
      }
    });
  };
  const widgetController = {
    openWalletsModal: () => void setTimeout(() => setWalletsModalOpen(true)),
    closeWalletsModal: () => void setTimeout(() => setWalletsModalOpen(false)),
    setAction: (action2) => void setTimeout(() => setAction(action2)),
    clearAction: () => void setTimeout(() => setAction(null)),
    getSelectedWalletInfo: () => lastSelectedWalletInfo(),
    renderApp: (root, tonConnectUI) => render(() => createComponent(App, {
      tonConnectUI
    }), document.getElementById(root))
  };
  class WalletInfoStorage {
    constructor() {
      __publicField(this, "localStorage");
      __publicField(this, "storageKey", "ton-connect-ui_wallet-info");
      checkLocalStorageExists();
      this.localStorage = localStorage;
    }
    setWalletInfo(walletInfo) {
      this.localStorage.setItem(this.storageKey, JSON.stringify(walletInfo));
    }
    getWalletInfo() {
      const walletInfoString = this.localStorage.getItem(this.storageKey);
      if (!walletInfoString) {
        return null;
      }
      return JSON.parse(walletInfoString);
    }
    removeWalletInfo() {
      this.localStorage.removeItem(this.storageKey);
    }
  }
  class PreferredWalletStorage {
    constructor() {
      __publicField(this, "localStorage");
      __publicField(this, "storageKey", "ton-connect-ui_preferred-wallet");
      checkLocalStorageExists();
      this.localStorage = localStorage;
    }
    setPreferredWalletAppName(name) {
      this.localStorage.setItem(this.storageKey, name);
    }
    getPreferredWalletAppName() {
      return this.localStorage.getItem(this.storageKey) || void 0;
    }
  }
  class TonConnectUI {
    constructor(options) {
      __publicField(this, "walletInfoStorage", new WalletInfoStorage());
      __publicField(this, "preferredWalletStorage", new PreferredWalletStorage());
      __publicField(this, "connector");
      __publicField(this, "walletInfo", null);
      __publicField(this, "systemThemeChangeUnsubscribe", null);
      __publicField(this, "actionsConfiguration");
      __publicField(this, "walletsList");
      __publicField(this, "connectRequestParametersCallback");
      __publicField(this, "connectionRestored", Promise.resolve(false));
      if (options && "connector" in options && options.connector) {
        this.connector = options.connector;
      } else if (options && "manifestUrl" in options && options.manifestUrl) {
        this.connector = new sdk.TonConnect({ manifestUrl: options.manifestUrl });
      } else {
        throw new TonConnectUIError(
          "You have to specify a `manifestUrl` or a `connector` in the options."
        );
      }
      this.walletsList = this.getWallets();
      this.walletsList.then((list) => preloadImages(uniq(list.map((item) => item.imageUrl))));
      const rootId = this.normalizeWidgetRoot(options == null ? void 0 : options.widgetRootId);
      this.subscribeToWalletChange();
      if ((options == null ? void 0 : options.restoreConnection) !== false) {
        this.connectionRestored = new Promise((resolve) => __async(this, null, function* () {
          yield this.connector.restoreConnection();
          if (!this.connector.connected) {
            this.walletInfoStorage.removeWalletInfo();
          }
          resolve(this.connector.connected);
        }));
      }
      this.uiOptions = mergeOptions(options, { uiPreferences: { theme: "SYSTEM" } });
      const preferredWalletName = this.preferredWalletStorage.getPreferredWalletAppName();
      setAppState({
        connector: this.connector,
        preferredWalletAppName: preferredWalletName
      });
      widgetController.renderApp(rootId, this);
    }
    static getWallets() {
      return sdk.TonConnect.getWallets();
    }
    get connected() {
      return this.connector.connected;
    }
    get account() {
      return this.connector.account;
    }
    get wallet() {
      if (!this.connector.wallet) {
        return null;
      }
      return __spreadValues(__spreadValues({}, this.connector.wallet), this.walletInfo);
    }
    set uiOptions(options) {
      var _a2, _b2, _c, _d, _e;
      this.checkButtonRootExist(options.buttonRootId);
      this.actionsConfiguration = options.actionsConfiguration;
      if ((_a2 = options.uiPreferences) == null ? void 0 : _a2.theme) {
        if (((_b2 = options.uiPreferences) == null ? void 0 : _b2.theme) !== "SYSTEM") {
          (_c = this.systemThemeChangeUnsubscribe) == null ? void 0 : _c.call(this);
          setTheme(options.uiPreferences.theme, options.uiPreferences.colorsSet);
        } else {
          setTheme(getSystemTheme(), options.uiPreferences.colorsSet);
          if (!this.systemThemeChangeUnsubscribe) {
            this.systemThemeChangeUnsubscribe = subscribeToThemeChange(setTheme);
          }
        }
      } else {
        if ((_d = options.uiPreferences) == null ? void 0 : _d.colorsSet) {
          setColors(options.uiPreferences.colorsSet);
        }
      }
      if ((_e = options.uiPreferences) == null ? void 0 : _e.borderRadius) {
        setBorderRadius(options.uiPreferences.borderRadius);
      }
      setAppState((state) => {
        var _a3;
        const merged = mergeOptions(
          __spreadValues(__spreadValues(__spreadValues({}, options.language && { language: options.language }), !!((_a3 = options.actionsConfiguration) == null ? void 0 : _a3.returnStrategy) && {
            returnStrategy: options.actionsConfiguration.returnStrategy
          }), !!options.walletsListConfiguration && {
            walletsListConfiguration: options.walletsListConfiguration
          }),
          unwrap(state)
        );
        if (options.buttonRootId !== void 0) {
          merged.buttonRootId = options.buttonRootId;
        }
        return merged;
      });
    }
    setConnectRequestParameters(connectRequestParameters) {
      var _a2;
      setAppState({ connectRequestParameters });
      if ((connectRequestParameters == null ? void 0 : connectRequestParameters.state) === "ready" || !connectRequestParameters) {
        (_a2 = this.connectRequestParametersCallback) == null ? void 0 : _a2.call(this, connectRequestParameters == null ? void 0 : connectRequestParameters.value);
      }
    }
    getWallets() {
      return __async(this, null, function* () {
        return this.connector.getWallets();
      });
    }
    onStatusChange(callback, errorsHandler) {
      return this.connector.onStatusChange((wallet) => __async(this, null, function* () {
        if (wallet) {
          const lastSelectedWalletInfo2 = yield this.getSelectedWalletInfo(wallet);
          callback(__spreadValues(__spreadValues({}, wallet), lastSelectedWalletInfo2 || this.walletInfoStorage.getWalletInfo()));
        } else {
          callback(wallet);
        }
      }), errorsHandler);
    }
    connectWallet() {
      return __async(this, null, function* () {
        const walletsList = yield this.getWallets();
        const embeddedWallet = walletsList.find(sdk.isWalletInfoCurrentlyEmbedded);
        if (embeddedWallet) {
          const connect = (parameters) => {
            setLastSelectedWalletInfo(embeddedWallet);
            this.connector.connect({ jsBridgeKey: embeddedWallet.jsBridgeKey }, parameters);
          };
          const additionalRequest = appState.connectRequestParameters;
          if ((additionalRequest == null ? void 0 : additionalRequest.state) === "loading") {
            this.connectRequestParametersCallback = connect;
          } else {
            connect(additionalRequest == null ? void 0 : additionalRequest.value);
          }
        } else {
          widgetController.openWalletsModal();
        }
        return new Promise((resolve, reject) => {
          const unsubscribe = this.connector.onStatusChange((wallet) => __async(this, null, function* () {
            unsubscribe();
            if (wallet) {
              const lastSelectedWalletInfo2 = yield this.getSelectedWalletInfo(wallet);
              resolve(__spreadValues(__spreadValues({}, wallet), lastSelectedWalletInfo2 || this.walletInfoStorage.getWalletInfo()));
            } else {
              reject(new TonConnectUIError("Wallet was not connected"));
            }
          }), reject);
        });
      });
    }
    disconnect() {
      widgetController.clearAction();
      this.walletInfoStorage.removeWalletInfo();
      return this.connector.disconnect();
    }
    sendTransaction(tx, options) {
      return __async(this, null, function* () {
        if (!this.connected) {
          throw new TonConnectUIError("Connect wallet to send a transaction.");
        }
        const { notifications: notifications2, modals, returnStrategy, skipRedirectToWallet } = this.getModalsAndNotificationsConfiguration(options);
        const userOSIsIos = getUserAgent().os === "ios";
        const shouldSkipRedirectToWallet = skipRedirectToWallet === "ios" && userOSIsIos || skipRedirectToWallet === "always";
        if (this.walletInfo && "universalLink" in this.walletInfo && this.walletInfo.openMethod === "universal-link" && !shouldSkipRedirectToWallet) {
          if (sdk.isTelegramUrl(this.walletInfo.universalLink)) {
            this.redirectToTelegram(this.walletInfo.universalLink);
          } else {
            openLink(addReturnStrategy(this.walletInfo.universalLink, returnStrategy));
          }
        }
        widgetController.setAction({
          name: "confirm-transaction",
          showNotification: notifications2.includes("before"),
          openModal: modals.includes("before")
        });
        try {
          const result = yield this.connector.sendTransaction(tx);
          widgetController.setAction({
            name: "transaction-sent",
            showNotification: notifications2.includes("success"),
            openModal: modals.includes("success")
          });
          return result;
        } catch (e2) {
          widgetController.setAction({
            name: "transaction-canceled",
            showNotification: notifications2.includes("error"),
            openModal: modals.includes("error")
          });
          if (e2 instanceof sdk.TonConnectError) {
            throw e2;
          } else {
            console.error(e2);
            throw new TonConnectUIError("Unhandled error:" + e2);
          }
        }
      });
    }
    subscribeToWalletChange() {
      this.connector.onStatusChange((wallet) => __async(this, null, function* () {
        var _a2;
        if (wallet) {
          yield this.updateWalletInfo(wallet);
          this.setPreferredWalletAppName(((_a2 = this.walletInfo) == null ? void 0 : _a2.appName) || wallet.device.appName);
        } else {
          this.walletInfoStorage.removeWalletInfo();
        }
      }));
    }
    setPreferredWalletAppName(value) {
      this.preferredWalletStorage.setPreferredWalletAppName(value);
      setAppState({ preferredWalletAppName: value });
    }
    getSelectedWalletInfo(wallet) {
      return __async(this, null, function* () {
        let lastSelectedWalletInfo2 = widgetController.getSelectedWalletInfo();
        if (!lastSelectedWalletInfo2) {
          return null;
        }
        let fullLastSelectedWalletInfo;
        if (!("name" in lastSelectedWalletInfo2)) {
          const walletsList = applyWalletsListConfiguration(
            yield this.walletsList,
            appState.walletsListConfiguration
          );
          const walletInfo = walletsList.find((item) => eqWalletName(item, wallet.device.appName));
          if (!walletInfo) {
            throw new TonConnectUIError(
              `Cannot find WalletInfo for the '${wallet.device.appName}' wallet`
            );
          }
          fullLastSelectedWalletInfo = __spreadValues(__spreadValues({}, walletInfo), lastSelectedWalletInfo2);
        } else {
          fullLastSelectedWalletInfo = lastSelectedWalletInfo2;
        }
        return fullLastSelectedWalletInfo;
      });
    }
    updateWalletInfo(wallet) {
      return __async(this, null, function* () {
        const selectedWalletInfo = yield this.getSelectedWalletInfo(wallet);
        if (selectedWalletInfo) {
          this.walletInfo = selectedWalletInfo;
          this.walletInfoStorage.setWalletInfo(selectedWalletInfo);
          return;
        }
        const storedWalletInfo = this.walletInfoStorage.getWalletInfo();
        if (storedWalletInfo) {
          this.walletInfo = storedWalletInfo;
          return;
        }
        this.walletInfo = (yield this.walletsList).find(
          (walletInfo) => eqWalletName(walletInfo, wallet.device.appName)
        ) || null;
      });
    }
    normalizeWidgetRoot(rootId) {
      if (!rootId || !document.getElementById(rootId)) {
        rootId = "tc-widget-root";
        const rootElement = document.createElement("div");
        rootElement.id = rootId;
        document.body.appendChild(rootElement);
      }
      return rootId;
    }
    checkButtonRootExist(buttonRootId) {
      if (buttonRootId == null) {
        return;
      }
      if (!document.getElementById(buttonRootId)) {
        throw new TonConnectUIError(`${buttonRootId} element not found in the document.`);
      }
    }
    getModalsAndNotificationsConfiguration(options) {
      var _a2, _b2, _c, _d, _e;
      const allActions = [
        "before",
        "success",
        "error"
      ];
      let notifications2 = allActions;
      if (((_a2 = this.actionsConfiguration) == null ? void 0 : _a2.notifications) && ((_b2 = this.actionsConfiguration) == null ? void 0 : _b2.notifications) !== "all") {
        notifications2 = this.actionsConfiguration.notifications;
      }
      if (options == null ? void 0 : options.notifications) {
        if (options.notifications === "all") {
          notifications2 = allActions;
        } else {
          notifications2 = options.notifications;
        }
      }
      let modals = ["before"];
      if ((_c = this.actionsConfiguration) == null ? void 0 : _c.modals) {
        if (this.actionsConfiguration.modals === "all") {
          modals = allActions;
        } else {
          modals = this.actionsConfiguration.modals;
        }
      }
      if (options == null ? void 0 : options.modals) {
        if (options.modals === "all") {
          modals = allActions;
        } else {
          modals = options.modals;
        }
      }
      const returnStrategy = (options == null ? void 0 : options.returnStrategy) || ((_d = this.actionsConfiguration) == null ? void 0 : _d.returnStrategy) || "back";
      const skipRedirectToWallet = (options == null ? void 0 : options.skipRedirectToWallet) || ((_e = this.actionsConfiguration) == null ? void 0 : _e.skipRedirectToWallet) || "ios";
      return {
        notifications: notifications2,
        modals,
        returnStrategy,
        skipRedirectToWallet
      };
    }
    redirectToTelegram(universalLink) {
      const url = new URL(universalLink);
      url.searchParams.append("startattach", "tonconnect");
      openLinkBlank(url.toString());
    }
  }
  exports2.THEME = THEME;
  exports2.TonConnectUI = TonConnectUI;
  exports2.TonConnectUIError = TonConnectUIError;
  for (const k in sdk) {
    if (k !== "default" && !exports2.hasOwnProperty(k))
      Object.defineProperty(exports2, k, {
        enumerable: true,
        get: () => sdk[k]
      });
  }
  Object.defineProperties(exports2, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
});
//# sourceMappingURL=index.umd.js.map
