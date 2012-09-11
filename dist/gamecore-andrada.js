/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * class.js
 * Classes and objects
 */

/**
 * @Class
 * A modified version of class.js to cater to static inheritance and deep object cloning
 * Based almost completely on class.js (Javascript MVC -- Justin Meyer, Brian Moschel, Michael Mayer and others)
 * (http://javascriptmvc.com/contribute.html)
 * Some portions adapted from Prototype JavaScript framework, version 1.6.0.1 (c) 2005-2007 Sam Stephenson
 * <p>
 * Class system for javascript
 * <p>
 * <code>
 *   var Fighter = gamecore.Base.extend('Fighter',
 *   {
 *       // static (this is inherited as well)
 *       firingSpeed: 1000
 *   },
 *   {
 *       // instance
 *
 *       hp: 0,
 *       lastFireTime: 0,
 *
 *       init: function(hp)
 *       {
 *           this.hp = hp;
 *       },
 *
 *       fire: function()
 *       {
 *           this._super(); // super methods!
 *
 *           // do firing!
 *       }
 *   });
 *
 *  var gunship = new Fighter(100);
 * </code>
 *
 * Introspection:
 * <code>
 *   gamecore.Base.extend(‘Fighter.Gunship’);
 *   Fighter.Gunship.shortName; // ‘Gunship’
 *   Fighter.Gunship.fullName;  // ‘Fighter.Gunship’
 *   Fighter.Gunship.namespace; // ‘Fighter’
 * </code>
 * <p>
 * Setup method will be called prior to any init -- nice if you want to do things without needing the
 * users to call _super in the init, as well as for normalizing parameters.
 * <code>
 *   setup: function()
 *   {
 *      this.objectId = this.Class.totalObjects++;
 *      this.uniqueId = this.Class.fullName + ':' + this.objectId;
 *   }
 * </code>
 */

// compatible with jquery classing
(function(window) {
    var $ = window.jQuery || window.Zepto,
        regs = {
            undHash:/_|-/,
            colons:/::/,
            words:/([A-Z]+)([A-Z][a-z])/g,
            lowUp:/([a-z\d])([A-Z])/g,
            dash:/([a-z\d])([A-Z])/g,
            replacer:/\{([^\}]+)\}/g,
            dot:/\./
        },
        getNext = function (current, nextPart, add) {
            return current[nextPart] || ( add && (current[nextPart] = {}) );
        },
        isContainer = function (current) {
            var type = typeof current;
            return type && (  type == 'function' || type == 'object' );
        },
        getObject = function (objectName, roots, add) {
            var parts = objectName ? objectName.split(regs.dot) : [],
                length = parts.length,
                currents = $.isArray(roots) ? roots : [roots || window],
                current,
                ret,
                i,
                c = 0,
                type;

            if (length == 0) {
                return currents[0];
            }
            while (current = currents[c++]) {
                for (i = 0; i < length - 1 && isContainer(current); i++) {
                    current = getNext(current, parts[i], add);
                }
                if (isContainer(current)) {

                    ret = getNext(current, parts[i], add);

                    if (ret !== undefined) {

                        if (add === false) {
                            delete current[parts[i]];
                        }
                        return ret;

                    }

                }
            }
        },

    /**
     * @class jQuery.String
     *
     * A collection of useful string helpers.
     *
     */
    str = $.String = $.extend($.String || {}, {
        /**
         * @function
         * Gets an object from a string.
         * @param {String} name the name of the object to look for
         * @param {Array} [roots] an array of root objects to look for the name
         * @param {Boolean} [add] true to add missing objects to
         *  the path. false to remove found properties. undefined to
         *  not modify the root object
         */
        getObject:getObject,
        /**
         * Capitalizes a string
         * @param {String} s the string.
         * @return {String} a string with the first character capitalized.
         */
        capitalize:function (s, cache) {
            return s.charAt(0).toUpperCase() + s.substr(1);
        },
        /**
         * Capitalizes a string from something undercored. Examples:
         * @codestart
         * jQuery.String.camelize("one_two") //-> "oneTwo"
         * "three-four".camelize() //-> threeFour
         * @codeend
         * @param {String} s
         * @return {String} a the camelized string
         */
        camelize:function (s) {
            s = str.classize(s);
            return s.charAt(0).toLowerCase() + s.substr(1);
        },
        /**
         * Like camelize, but the first part is also capitalized
         * @param {String} s
         * @return {String} the classized string
         */
        classize:function (s, join) {
            var parts = s.split(regs.undHash),
                i = 0;
            for (; i < parts.length; i++) {
                parts[i] = str.capitalize(parts[i]);
            }

            return parts.join(join || '');
        },
        /**
         * Like [jQuery.String.classize|classize], but a space separates each 'word'
         * @codestart
         * jQuery.String.niceName("one_two") //-> "One Two"
         * @codeend
         * @param {String} s
         * @return {String} the niceName
         */
        niceName:function (s) {
            return str.classize(s, ' ');
        },

        /**
         * Underscores a string.
         * @codestart
         * jQuery.String.underscore("OneTwo") //-> "one_two"
         * @codeend
         * @param {String} s
         * @return {String} the underscored string
         */
        underscore:function (s) {
            return s.replace(regs.colons, '/').replace(regs.words, '$1_$2').replace(regs.lowUp, '$1_$2').replace(regs.dash, '_').toLowerCase();
        },
        /**
         * Returns a string with {param} replaced values from data.
         *
         *     $.String.sub("foo {bar}",{bar: "far"})
         *     //-> "foo far"
         *
         * @param {String} s The string to replace
         * @param {Object} data The data to be used to look for properties.  If it's an array, multiple
         * objects can be used.
         * @param {Boolean} [remove] if a match is found, remove the property from the object
         */
        sub:function (s, data, remove) {
            var obs = [];
            obs.push(s.replace(regs.replacer, function (whole, inside) {
                //convert inside to type
                var ob = getObject(inside, data, typeof remove == 'boolean' ? !remove : remove),
                    type = typeof ob;
                if ((type === 'object' || type === 'function') && type !== null) {
                    obs.push(ob);
                    return "";
                } else {
                    return "" + ob;
                }
            }));
            return obs.length <= 1 ? obs[0] : obs;
        }
    });
}(window));
(function (window) {
    // if we are initializing a new class
    var $ = window.jQuery || window.Zepto,
        initializing = false,
        isFunction = $.isFunction,
        makeArray = isFunction($.makeArray) ? $.makeArray : function(obj) {
            var ret = []
            $.each(obj, function(i, a) {
                ret[i] = a;
            })
            return ret;
        },
        isArray = $.isArray,
        extend = $.extend,

        /**
         *
         */
        cloneObject = function (object) {
            if (!object || typeof(object) != 'object')
                return object;

            // special case handling of array (deep copy them)
            if (object instanceof Array) {
                var clone = [];
                for (var c = 0; c < object.length; c++)
                    clone[c] = cloneObject(object[c]);
                return clone;
            }
            else // otherwise, it's a normal object, clone it's properties
            {
                var cloneObj = {};
                for (var prop in object)
                    cloneObj[prop] = cloneObject(object[prop]);
                return cloneObj;
            }
        },

        concatArgs = function (arr, args) {
            return arr.concat(makeArray(args));
        },
        // tests if we can get super in .toString()
        fnTest = /xyz/.test(function () {
            xyz;
        }) ? /\b_super\b/ : /.*/,
        // overwrites an object with methods, sets up _super
        // newProps - new properties
        // oldProps - where the old properties might be
        // addTo - what we are adding to
        inheritProps = function (newProps, oldProps, addTo) {
            addTo = addTo || newProps
            for (var name in newProps) {
                // Check if we're overwriting an existing function
                addTo[name] = isFunction(newProps[name]) &&
                    isFunction(oldProps[name]) &&
                    fnTest.test(newProps[name]) ? (function (name, fn) {
                    return function () {
                        var tmp = this._super, ret;

                        // Add a new ._super() method that is the same method but on the super-class
                        this._super = oldProps[name];

                        // The method only need to be bound temporarily, so we remove it when we're done executing
                        ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, newProps[name]) : newProps[name];
            }
        },


        /**
         * @class jQuery.Class
         * @plugin jquery/class
         * @tag core
         * @download dist/jquery/jquery.class.js
         * @test jquery/class/qunit.html
         *
         * Class provides simulated inheritance in JavaScript. Use clss to bridge the gap between
         * jQuery's functional programming style and Object Oriented Programming. It
         * is based off John Resig's [http://ejohn.org/blog/simple-javascript-inheritance/|Simple Class]
         * Inheritance library.  Besides prototypal inheritance, it includes a few important features:
         *
         *   - Static inheritance
         *   - Introspection
         *   - Namespaces
         *   - Setup and initialization methods
         *   - Easy callback function creation
         *
         *
         * ## Static v. Prototype
         *
         * Before learning about Class, it's important to
         * understand the difference between
         * a class's __static__ and __prototype__ properties.
         *
         *     //STATIC
         *     MyClass.staticProperty  //shared property
         *
         *     //PROTOTYPE
         *     myclass = new MyClass()
         *     myclass.prototypeMethod() //instance method
         *
         * A static (or class) property is on the Class constructor
         * function itself
         * and can be thought of being shared by all instances of the
         * Class. Prototype propertes are available only on instances of the Class.
         *
         * ## A Basic Class
         *
         * The following creates a Monster class with a
         * name (for introspection), static, and prototype members.
         * Every time a monster instance is created, the static
         * count is incremented.
         *
         * @codestart
         * $.Class.extend('Monster',
         * /* @static *|
         * {
         *   count: 0
         * },
         * /* @prototype *|
         * {
         *   init: function( name ) {
         *
         *     // saves name on the monster instance
         *     this.name = name;
         *
         *     // sets the health
         *     this.health = 10;
         *
         *     // increments count
         *     this.Class.count++;
         *   },
         *   eat: function( smallChildren ){
         *     this.health += smallChildren;
         *   },
         *   fight: function() {
         *     this.health -= 2;
         *   }
         * });
         *
         * hydra = new Monster('hydra');
         *
         * dragon = new Monster('dragon');
         *
         * hydra.name        // -> hydra
         * Monster.count     // -> 2
         * Monster.shortName // -> 'Monster'
         *
         * hydra.eat(2);     // health = 12
         *
         * dragon.fight();   // health = 8
         *
         * @codeend
         *
         *
         * Notice that the prototype <b>init</b> function is called when a new instance of Monster is created.
         *
         *
         * ## Inheritance
         *
         * When a class is extended, all static and prototype properties are available on the new class.
         * If you overwrite a function, you can call the base class's function by calling
         * <code>this._super</code>.  Lets create a SeaMonster class.  SeaMonsters are less
         * efficient at eating small children, but more powerful fighters.
         *
         *
         *     Monster.extend("SeaMonster",{
         *       eat: function( smallChildren ) {
         *         this._super(smallChildren / 2);
         *       },
         *       fight: function() {
         *         this.health -= 1;
         *       }
         *     });
         *
         *     lockNess = new SeaMonster('Lock Ness');
         *     lockNess.eat(4);   //health = 12
         *     lockNess.fight();  //health = 11
         *
         * ### Static property inheritance
         *
         * You can also inherit static properties in the same way:
         *
         *     $.Class.extend("First",
         *     {
         *         staticMethod: function() { return 1;}
         *     },{})
         *
         *     First.extend("Second",{
         *         staticMethod: function() { return this._super()+1;}
         *     },{})
         *
         *     Second.staticMethod() // -> 2
         *
         * ## Namespaces
         *
         * Namespaces are a good idea! We encourage you to namespace all of your code.
         * It makes it possible to drop your code into another app without problems.
         * Making a namespaced class is easy:
         *
         * @codestart
         * $.Class.extend("MyNamespace.MyClass",{},{});
         *
         * new MyNamespace.MyClass()
         * @codeend
         * <h2 id='introspection'>Introspection</h2>
         * Often, it's nice to create classes whose name helps determine functionality.  Ruby on
         * Rails's [http://api.rubyonrails.org/classes/ActiveRecord/Base.html|ActiveRecord] ORM class
         * is a great example of this.  Unfortunately, JavaScript doesn't have a way of determining
         * an object's name, so the developer must provide a name.  Class fixes this by taking a String name for the class.
         * @codestart
         * $.Class.extend("MyOrg.MyClass",{},{})
         * MyOrg.MyClass.shortName //-> 'MyClass'
         * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
         * @codeend
         * The fullName (with namespaces) and the shortName (without namespaces) are added to the Class's
         * static properties.
         *
         *
         * <h2>Setup and initialization methods</h2>
         * <p>
         * Class provides static and prototype initialization functions.
         * These come in two flavors - setup and init.
         * Setup is called before init and
         * can be used to 'normalize' init's arguments.
         * </p>
         * <div class='whisper'>PRO TIP: Typically, you don't need setup methods in your classes. Use Init instead.
         * Reserve setup methods for when you need to do complex pre-processing of your class before init is called.
         *
         * </div>
         * @codestart
         * $.Class.extend("MyClass",
         * {
         *   setup: function() {} //static setup
         *   init: function() {} //static constructor
         * },
         * {
         *   setup: function() {} //prototype setup
         *   init: function() {} //prototype constructor
         * })
         * @codeend
         *
         * <h3>Setup</h3>
         * <p>Setup functions are called before init functions.  Static setup functions are passed
         * the base class followed by arguments passed to the extend function.
         * Prototype static functions are passed the Class constructor function arguments.</p>
         * <p>If a setup function returns an array, that array will be used as the arguments
         * for the following init method.  This provides setup functions the ability to normalize
         * arguments passed to the init constructors.  They are also excellent places
         * to put setup code you want to almost always run.</p>
         * <p>
         * The following is similar to how [jQuery.Controller.prototype.setup]
         * makes sure init is always called with a jQuery element and merged options
         * even if it is passed a raw
         * HTMLElement and no second parameter.
         * </p>
         * @codestart
         * $.Class.extend("jQuery.Controller",{
         *   ...
         * },{
         *   setup: function( el, options ) {
         *     ...
         *     return [$(el),
         *             $.extend(true,
         *                this.Class.defaults,
         *                options || {} ) ]
         *   }
         * })
         * @codeend
         * Typically, you won't need to make or overwrite setup functions.
         * <h3>Init</h3>
         *
         * <p>Init functions are called after setup functions.
         * Typically, they receive the same arguments
         * as their preceding setup function.  The Foo class's <code>init</code> method
         * gets called in the following example:
         * </p>
         * @codestart
         * $.Class.Extend("Foo", {
         *   init: function( arg1, arg2, arg3 ) {
         *     this.sum = arg1+arg2+arg3;
         *   }
         * })
         * var foo = new Foo(1,2,3);
         * foo.sum //-> 6
         * @codeend
         * <h2>Callbacks</h2>
         * <p>Similar to jQuery's proxy method, Class provides a
         * [jQuery.Class.static.callback callback]
         * function that returns a callback to a method that will always
         * have
         * <code>this</code> set to the class or instance of the class.
         * </p>
         * The following example uses this.callback to make sure
         * <code>this.name</code> is available in <code>show</code>.
         * @codestart
         * $.Class.extend("Todo",{
         *   init: function( name ) { this.name = name }
         *   get: function() {
         *     $.get("/stuff",this.callback('show'))
         *   },
         *   show: function( txt ) {
         *     alert(this.name+txt)
         *   }
         * })
         * new Todo("Trash").get()
         * @codeend
         * <p>Callback is available as a static and prototype method.</p>
         *
         * <h2>Typing<h2>
         * Classes are automatically populating with three type related components:
         *
         * _types: a variable that contains an array of types of this class (extends history)
         * _fullTypeName: a string representation of the extends hierarchy
         * isA(string): a function you can call which will return true if the class is of a given type string.
         * <p>
         * Example:
         * <p>
         * Animal.extend('Tiger', {}, {});
         * Tiger._types; // ['Animal', 'Tiger']
         * Tiger._fullTypeName; // 'Animal | Tiger |"
         * Tiger.isA('Animal'); // true
         * </p>
         * @constructor Creating a new instance of an object that has extended jQuery.Class
         *     calls the init prototype function and returns a new instance of the class.
         *
         */

            clss = $.Class = function () {
            if (arguments.length) {
                return clss.extend.apply(clss, arguments);
            }
        };

    /* @Static*/
    extend(clss, {
        /**
         * @function callback
         * Returns a callback function for a function on this Class.
         * The callback function ensures that 'this' is set appropriately.
         * @codestart
         * $.Class.extend("MyClass",{
         *     getData: function() {
         *         this.showing = null;
         *         $.get("data.json",this.callback('gotData'),'json')
         *     },
         *     gotData: function( data ) {
         *         this.showing = data;
         *     }
         * },{});
         * MyClass.showData();
         * @codeend
         * <h2>Currying Arguments</h2>
         * Additional arguments to callback will fill in arguments on the returning function.
         * @codestart
         * $.Class.extend("MyClass",{
         *    getData: function( <b>callback</b> ) {
         *      $.get("data.json",this.callback('process',<b>callback</b>),'json');
         *    },
         *    process: function( <b>callback</b>, jsonData ) { //callback is added as first argument
         *        jsonData.processed = true;
         *        callback(jsonData);
         *    }
         * },{});
         * MyClass.getData(showDataFunc)
         * @codeend
         * <h2>Nesting Functions</h2>
         * Callback can take an array of functions to call as the first argument.  When the returned callback function
         * is called each function in the array is passed the return value of the prior function.  This is often used
         * to eliminate currying initial arguments.
         * @codestart
         * $.Class.extend("MyClass",{
         *    getData: function( callback ) {
         *      //calls process, then callback with value from process
         *      $.get("data.json",this.callback(['process2',callback]),'json')
         *    },
         *    process2: function( type,jsonData ) {
         *        jsonData.processed = true;
         *        return [jsonData];
         *    }
         * },{});
         * MyClass.getData(showDataFunc);
         * @codeend
         * @param {String|Array} fname If a string, it represents the function to be called.
         * If it is an array, it will call each function in order and pass the return value of the prior function to the
         * next function.
         * @return {Function} the callback function.
         */
        callback:function (funcs) {
            //args that should be curried
            var args = makeArray(arguments),
                self;

            funcs = args.shift();

            if (!isArray(funcs)) {
                funcs = [funcs];
            }

            self = this;

            return function class_cb() {
                var cur = concatArgs(args, arguments),
                    isString,
                    length = funcs.length,
                    f = 0,
                    func;

                for (; f < length; f++) {
                    func = funcs[f];
                    if (!func)
                        continue;

                    isString = typeof func == "string";
                    if (isString && self._set_called)
                        self.called = func;

                    cur = (isString ? self[func] : func).apply(self, cur || []);
                    if (f < length - 1)
                        cur = !isArray(cur) || cur._use_call ? [cur] : cur
                }
                return cur;
            }
        },
        /**
         *   @function getObject
         *   Gets an object from a String.
         *   If the object or namespaces the string represent do not
         *   exist it will create them.
         *   @codestart
         *   Foo = {Bar: {Zar: {"Ted"}}}
         *   $.Class.getobject("Foo.Bar.Zar") //-> "Ted"
         *   @codeend
         *   @param {String} objectName the object you want to get
         *   @param {Object} [current=window] the object you want to look in.
         *   @return {Object} the object you are looking for.
         */
        getObject:$.String.getObject,
        /**
         * @function newInstance
         * Creates a new instance of the class.  This method is useful for creating new instances
         * with arbitrary parameters.
         * <h3>Example</h3>
         * @codestart
         * $.Class.extend("MyClass",{},{})
         * var mc = MyClass.newInstance.apply(null, new Array(parseInt(Math.random()*10,10))
         * @codeend
         * @return {class} instance of the class
         */
        newInstance:function () {
            var inst = this.rawInstance();
            var args;

            if (inst.setup)
                args = inst.setup.apply(inst, arguments);

            // Added by martin@playcraftlabs.com -- fix for deep cloning of properties
            for (var prop in inst.__proto__)
                inst[prop] = cloneObject(inst[prop]);

            if (inst.init)
                inst.init.apply(inst, isArray(args) ? args : arguments);

            return inst;
        },
        /**
         * Setup gets called on the inherting class with the base class followed by the
         * inheriting class's raw properties.
         *
         * Setup will deeply extend a static defaults property on the base class with
         * properties on the base class.  For example:
         *
         *     $.Class("MyBase",{
         *       defaults : {
         *         foo: 'bar'
         *       }
         *     },{})
         *
         *     MyBase("Inheriting",{
         *       defaults : {
         *         newProp : 'newVal'
         *       }
         *     },{}
         *
         *     Inheriting.defaults -> {foo: 'bar', 'newProp': 'newVal'}
         *
         * @param {Object} baseClass the base class that is being inherited from
         * @param {String} fullName the name of the new class
         * @param {Object} staticProps the static properties of the new class
         * @param {Object} protoProps the prototype properties of the new class
         */
        setup:function (baseClass, fullName) {
            this.defaults = extend(true, {}, baseClass.defaults, this.defaults);
            if (this._types == undefined) this._types = [];
            this._types.push(this.fullName);
            if (this._fullTypeName == undefined) this._fullTypeName = '|';
            this._fullTypeName += this.fullName + '|';
            return arguments;
        },
        rawInstance:function () {
            initializing = true;
            var inst = new this();
            initializing = false;
            return inst;
        },
        /**
         * Extends a class with new static and prototype functions.  There are a variety of ways
         * to use extend:
         * @codestart
         * //with className, static and prototype functions
         * $.Class.extend('Task',{ STATIC },{ PROTOTYPE })
         * //with just classname and prototype functions
         * $.Class.extend('Task',{ PROTOTYPE })
         * //With just a className
         * $.Class.extend('Task')
         * @codeend
         * @param {String} [fullName]  the classes name (used for classes w/ introspection)
         * @param {Object} [klass]  the new classes static/class functions
         * @param {Object} [proto]  the new classes prototype functions
         * @return {jQuery.Class} returns the new class
         */
        extend:function (fullName, klass, proto) {
            // figure out what was passed
            if (typeof fullName != 'string') {
                proto = klass;
                klass = fullName;
                fullName = null;
            }
            if (!proto) {
                proto = klass;
                klass = null;
            }

            proto = proto || {};
            var _super_class = this,
                _super = this.prototype,
                name, shortName, namespace, prototype;

            // append the isA function
            this.isA = function (typeName) {
                return this._fullTypeName.indexOf('|' + typeName + '|') != -1;
            };

            // Instantiate a base class (but only create the instance,
            // don't run the init constructor)
            initializing = true;
            prototype = new this();
            initializing = false;
            // Copy the properties over onto the new prototype
            inheritProps(proto, _super, prototype);

            // The dummy class constructor

            function Class() {
                // All construction is actually done in the init method
                if (initializing) return;

                if (this.constructor !== Class && arguments.length) { //we are being called w/o new
                    return arguments.callee.extend.apply(arguments.callee, arguments)
                } else { //we are being called w/ new
                    // copy objects

                    return this.Class.newInstance.apply(this.Class, arguments)
                }
            }

            // Copy old stuff onto class
            for (name in this)
                if (this.hasOwnProperty(name))
                    Class[name] = cloneObject(this[name]);

            // copy new props on class
            inheritProps(klass, this, Class);

            // do namespace stuff
            if (fullName) {
                var parts = fullName.split(/\./);
                var shortName = parts.pop();

                // Martin Wells (playcraft): bug fix. Don't add a namespace object if the class name
                // has no namespace elements (i.e. it's just "MyClass", not "MyProject.MyClass")
                if (parts.length > 0) {
                    current = clss.getObject(parts.join('.'), window, true),
                        namespace = current;
                }

                current[shortName] = Class;
            }

            // set things that can't be overwritten
            extend(Class, {
                prototype:prototype,
                namespace:namespace,
                shortName:shortName,
                constructor:Class,
                fullName:fullName
            });

            //make sure our prototype looks nice
            Class.prototype.Class = Class.prototype.constructor = Class;


            /**
             * @attribute fullName
             * The full name of the class, including namespace, provided for introspection purposes.
             * @codestart
             * $.Class.extend("MyOrg.MyClass",{},{})
             * MyOrg.MyClass.shortName //-> 'MyClass'
             * MyOrg.MyClass.fullName //->  'MyOrg.MyClass'
             * @codeend
             */

            var args = Class.setup.apply(Class, concatArgs([_super_class], arguments));

            if (Class.init) {
                Class.init.apply(Class, args || []);
            }

            /* @Prototype*/

            return Class;
            /**
             * @function setup
             * If a setup method is provided, it is called when a new
             * instances is created.  It gets passed the same arguments that
             * were given to the Class constructor function (<code> new Class( arguments ... )</code>).
             *
             *     $.Class("MyClass",
             *     {
             *        setup: function( val ) {
             *           this.val = val;
             *         }
             *     })
             *     var mc = new MyClass("Check Check")
             *     mc.val //-> 'Check Check'
             *
             * Setup is called before [jQuery.Class.prototype.init init].  If setup
             * return an array, those arguments will be used for init.
             *
             *     $.Class("jQuery.Controller",{
             *       setup : function(htmlElement, rawOptions){
             *         return [$(htmlElement),
             *                   $.extend({}, this.Class.defaults, rawOptions )]
             *       }
             *     })
             *
             * <div class='whisper'>PRO TIP:
             * Setup functions are used to normalize constructor arguments and provide a place for
             * setup code that extending classes don't have to remember to call _super to
             * run.
             * </div>
             *
             * Setup is not defined on $.Class itself, so calling super in inherting classes
             * will break.  Don't do the following:
             *
             *     $.Class("Thing",{
             *       setup : function(){
             *         this._super(); // breaks!
             *       }
             *     })
             *
             * @return {Array|undefined} If an array is return, [jQuery.Class.prototype.init] is
             * called with those arguments; otherwise, the original arguments are used.
             */
            //break up
            /**
             * @function init
             * If an <code>init</code> method is provided, it gets called when a new instance
             * is created.  Init gets called after [jQuery.Class.prototype.setup setup], typically with the
             * same arguments passed to the Class
             * constructor: (<code> new Class( arguments ... )</code>).
             *
             *     $.Class("MyClass",
             *     {
             *        init: function( val ) {
             *           this.val = val;
             *        }
             *     })
             *     var mc = new MyClass(1)
             *     mc.val //-> 1
             *
             * [jQuery.Class.prototype.setup Setup] is able to modify the arguments passed to init.  Read
             * about it there.
             *
             */
            //Breaks up code
            /**
             * @attribute Class
             * References the static properties of the instance's class.
             * <h3>Quick Example</h3>
             * @codestart
             * // a class with a static classProperty property
             * $.Class.extend("MyClass", {classProperty : true}, {});
             *
             * // a new instance of myClass
             * var mc1 = new MyClass();
             *
             * //
             * mc1.Class.classProperty = false;
             *
             * // creates a new MyClass
             * var mc2 = new mc.Class();
             * @codeend
             * Getting static properties via the Class property, such as it's
             * [jQuery.Class.static.fullName fullName] is very common.
             */
        }

    })


    clss.prototype.
    /**
     * @function callback
     * Returns a callback function.  This does the same thing as and is described better in [jQuery.Class.static.callback].
     * The only difference is this callback works
     * on a instance instead of a class.
     * @param {String|Array} fname If a string, it represents the function to be called.
     * If it is an array, it will call each function in order and pass the return value of the prior function to the
     * next function.
     * @return {Function} the callback function
     */
        callback = clss.callback;
}(window));
/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * gamecore.js
 * Namespace wrappers and the base class
 */

window.gamecore = {};
gamecore.Class = $.Class;

/**
 * @class gamecore.Base
 * A base class providing logging, object counting and unique object id's
 * Examples:
 *
 * Unique ID and total objects:
 * <code>
 * var Fighter = gamecore.Base.extend('Fighter', {}, {});
 * var fighter1 = new Fighter();
 * var fighter2 = new Fighter();
 * fighter1.uniqueId;    // -> 'Fighter:0'
 * fighter2.uniqueId;    // -> 'Fighter:1'
 * Fighter.totalObjects; // -> 2
 * </code>
 *
 * Logging: (log, info, warn, error, debug)
 * <code>
 * fighter1.warn('oops'); // == console.log('Fighter:0 [WARN] oops');
 */

gamecore.Base = gamecore.Class('gamecore.Base',
    ///
    /// STATIC
    ///
    {
        totalObjects: 0,
        WARN: 'WARN',
        DEBUG: 'DEBUG',
        ERROR: 'ERROR',
        INFO: 'INFO',

        log: function(id, type, message)
        {
            var idString = '';
            if (id) idString = ':'+id;
            console.log(this.fullName + idString + ' [' + type + '] ' + message);
        },

        warn: function (message)
        {
            this.log(null, this.WARN, message);
        },

        debug: function (message)
        {
            this.log(null, this.DEBUG, message);
        },

        error: function (message)
        {
            this.log(null, this.ERROR, message);
        },

        info: function (message)
        {
            this.log(null, this.INFO, message);
        },

        assert: function(msg, condition)
        {
            if (!condition)
                throw msg;
        }

    },
    ///
    /// INSTANCE
    ///
    {
        objectId: 0,
        uniqueId: null,

        init: function()
        {
        },

        setup: function()
        {
            this.objectId = this.Class.totalObjects++;
            this.uniqueId = this.Class.fullName + ':' + this.objectId;
        },

        /**
         * @returns {String} A system-wide unique Id for this object instance
         */
        getUniqueId: function()
        {
            // if you see a null error here, then likely you have forgotten to call
            // this._super in a subclassed init method.
            return this.uniqueId;
        },

        /**
         * @returns {String} A hash matching this object. Override this to implement different
         * kinds of object hashing in derived classes.
         */
        hashCode: function()
        {
            return this.getUniqueId();
        },

        warn: function (message)
        {
            this.Class.log(this.objectId, this.Class.WARN, message);
        },
        debug: function (message)
        {
            this.Class.log(this.objectId, this.Class.DEBUG, message);
        },
        error: function (message)
        {
            this.Class.log(this.objectId, this.Class.ERROR, message);
        },
        info: function (message)
        {
            this.Class.log(this.objectId, this.Class.INFO, message);
        },

        toString: function()
        {
            return this.Class.fullName + ' [id: ' + this.objectId + ']';
        }
    });


/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * device.js
 * Access to device capabilities
 */

/**
 * @class gamecore.Device
 * Staic class with lots of device information.
 */

gamecore.Device = gamecore.Base.extend('gamecore.Device',
    {
        pixelRatio:0,
        isiPhone:false,
        isiPhone4:false,
        isiPad:false,
        isAndroid:false,
        isTouch:false,
        isFirefox:false,
        isChrome:false,
        isOpera:false,
        isIE:false,
        ieVersion:0,
        requestAnimFrame:null,
        hasMemoryProfiling:false,
        canPlayOgg: false,
        canPlayMP3: false,
        canPlayWav: false,

        init:function ()
        {
            this.pixelRatio = window.devicePixelRatio || 1;
            this.isiPhone = navigator.userAgent.toLowerCase().indexOf('iphone') != -1;
            this.isiPhone4 = (this.pixelRatio == 2 && this.isiPhone);
            this.isiPad = navigator.userAgent.toLowerCase().indexOf('ipad') != -1;
            this.isAndroid = navigator.userAgent.toLowerCase().indexOf('android') != -1;
            this.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') != -1;
            this.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') != -1;
            this.isOpera = navigator.userAgent.toLowerCase().indexOf('opera') != -1;
            this.isTouch = window.ontouchstart !== 'undefined';

            if (window.performance != undefined)
                this.hasMemoryProfiling = (window.performance.memory);

            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent))
            {
                this.ieVersion = new Number(RegExp.$1);
                this.isIE = true;
            }

            // determine what sound formats we can play
            var check = new Audio();
            if (check.canPlayType('audio/ogg')) this.canPlayOgg = true;
            if (check.canPlayType('audio/mpeg')) this.canPlayMP3 = true;
            if (check.canPlayType('audio/x-wav')) this.canPlayWav = true;

            this.requestAnimFrame = (function ()
            {
                var request =
                    window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function (callback, element)
                        {
                            window.setTimeout(callback, 16, Date.now());
                        };

                // apply to our window global to avoid illegal invocations (it's a native)
                return function (callback, element)
                {
                    request.apply(window, [callback, element]);
                };
            })();

            // todo:
            // highres timer
            // game pads
            // fullscreen api
            // mouse lock
        },

        canPlay: function(format)
        {
            if (format.toLowerCase() === 'mp3' && this.canPlayMP3) return true;
            if (format.toLowerCase() === 'ogg' && this.canPlayOgg) return true;
            if (format.toLowerCase() === 'wav' && this.canPlayWav) return true;
            return false;
        },

        getUsedHeap:function ()
        {
            return this.hasMemoryProfiling ? window.performance.memory.usedJSHeapSize : 0;
        },

        getTotalHeap:function ()
        {
            return this.hasMemoryProfiling ? window.performance.memory.totalJSHeapSize : 0;
        }


    },
    {
        // Singleton static class, so nothing required here
    });
/**
 * Copyright 2010 Tim Down.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Author: Tim Down <tim@timdown.co.uk>
 * Version: 2.1
 * Build date: 21 March 2010
 * Website: http://www.timdown.co.uk/jshashtable
 *
 * (Slight mod to add to gamecore namespace -- martin@playcraftlabs.com)
 */

/**
 * jshashtable
 *
 * jshashtable is a JavaScript implementation of a hash table. It creates a single constructor function called Hashtable
 * in the global scope.
 * Example:
 * <code>
 *     var map = new gamecore.Hashtable();
 *     map.put('test1', obj);
 *     var obj = map.get('test1');
 * </code>
 */

gamecore.Hashtable = (function ()
{
    var FUNCTION = "function";

    var arrayRemoveAt = (typeof Array.prototype.splice == FUNCTION) ?
        function (arr, idx)
        {
            arr.splice(idx, 1);
        } :

        function (arr, idx)
        {
            var itemsAfterDeleted, i, len;
            if (idx === arr.length - 1)
            {
                arr.length = idx;
            } else
            {
                itemsAfterDeleted = arr.slice(idx + 1);
                arr.length = idx;
                for (i = 0, len = itemsAfterDeleted.length; i < len; ++i)
                {
                    arr[idx + i] = itemsAfterDeleted[i];
                }
            }
        };

    function hashObject(obj)
    {
        var hashCode;
        if (typeof obj == "string")
        {
            return obj;
        } else if (typeof obj.hashCode == FUNCTION)
        {
            // Check the hashCode method really has returned a string
            hashCode = obj.hashCode();
            return (typeof hashCode == "string") ? hashCode : hashObject(hashCode);
        } else if (typeof obj.toString == FUNCTION)
        {
            return obj.toString();
        } else
        {
            try
            {
                return String(obj);
            }
            catch (ex)
            {
                // For host objects (such as ActiveObjects in IE) that have no toString() method and throw an error when
                // passed to String()
                return Object.prototype.toString.call(obj);
            }
        }
    }

    function equals_fixedValueHasEquals(fixedValue, variableValue)
    {
        return fixedValue.equals(variableValue);
    }

    function equals_fixedValueNoEquals(fixedValue, variableValue)
    {
        return (typeof variableValue.equals == FUNCTION) ?
            variableValue.equals(fixedValue) : (fixedValue === variableValue);
    }

    function createKeyValCheck(kvStr)
    {
        return function (kv)
        {
            if (kv === null)
            {
                throw new Error("null is not a valid " + kvStr);
            } else if (typeof kv == "undefined")
            {
                throw new Error(kvStr + " must not be undefined");
            }
        };
    }

    var checkKey = createKeyValCheck("key"), checkValue = createKeyValCheck("value");

    /*----------------------------------------------------------------------------------------------------------------*/

    function Bucket(hash, firstKey, firstValue, equalityFunction)
    {
        this[0] = hash;
        this.entries = [];
        this.addEntry(firstKey, firstValue);

        if (equalityFunction !== null)
        {
            this.getEqualityFunction = function ()
            {
                return equalityFunction;
            };
        }
    }

    var EXISTENCE = 0, ENTRY = 1, ENTRY_INDEX_AND_VALUE = 2;

    function createBucketSearcher(mode)
    {
        return function (key)
        {
            var i = this.entries.length, entry, equals = this.getEqualityFunction(key);
            while (i--)
            {
                entry = this.entries[i];
                if (equals(key, entry[0]))
                {
                    switch (mode)
                    {
                        case EXISTENCE:
                            return true;
                        case ENTRY:
                            return entry;
                        case ENTRY_INDEX_AND_VALUE:
                            return [ i, entry[1] ];
                    }
                }
            }
            return false;
        };
    }

    function createBucketLister(entryProperty)
    {
        return function (aggregatedArr)
        {
            var startIndex = aggregatedArr.length;
            for (var i = 0, len = this.entries.length; i < len; ++i)
            {
                aggregatedArr[startIndex + i] = this.entries[i][entryProperty];
            }
        };
    }

    Bucket.prototype = {
        getEqualityFunction:function (searchValue)
        {
            return (typeof searchValue.equals == FUNCTION) ? equals_fixedValueHasEquals : equals_fixedValueNoEquals;
        },

        getEntryForKey:createBucketSearcher(ENTRY),

        getEntryAndIndexForKey:createBucketSearcher(ENTRY_INDEX_AND_VALUE),

        removeEntryForKey:function (key)
        {
            var result = this.getEntryAndIndexForKey(key);
            if (result)
            {
                arrayRemoveAt(this.entries, result[0]);
                return result[1];
            }
            return null;
        },

        addEntry:function (key, value)
        {
            this.entries[this.entries.length] = [key, value];
        },

        keys:createBucketLister(0),

        values:createBucketLister(1),

        getEntries:function (entries)
        {
            var startIndex = entries.length;
            for (var i = 0, len = this.entries.length; i < len; ++i)
            {
                // Clone the entry stored in the bucket before adding to array
                entries[startIndex + i] = this.entries[i].slice(0);
            }
        },

        containsKey:createBucketSearcher(EXISTENCE),

        containsValue:function (value)
        {
            var i = this.entries.length;
            while (i--)
            {
                if (value === this.entries[i][1])
                {
                    return true;
                }
            }
            return false;
        }
    };

    /*----------------------------------------------------------------------------------------------------------------*/

    // Supporting functions for searching hashtable buckets

    function searchBuckets(buckets, hash)
    {
        var i = buckets.length, bucket;
        while (i--)
        {
            bucket = buckets[i];
            if (hash === bucket[0])
            {
                return i;
            }
        }
        return null;
    }

    function getBucketForHash(bucketsByHash, hash)
    {
        var bucket = bucketsByHash[hash];

        // Check that this is a genuine bucket and not something inherited from the bucketsByHash's prototype
        return ( bucket && (bucket instanceof Bucket) ) ? bucket : null;
    }

    /*----------------------------------------------------------------------------------------------------------------*/

    function Hashtable(hashingFunctionParam, equalityFunctionParam)
    {
        var that = this;
        var buckets = [];
        var bucketsByHash = {};

        var hashingFunction = (typeof hashingFunctionParam == FUNCTION) ? hashingFunctionParam : hashObject;
        var equalityFunction = (typeof equalityFunctionParam == FUNCTION) ? equalityFunctionParam : null;

        this.put = function (key, value)
        {
            checkKey(key);
            checkValue(value);
            var hash = hashingFunction(key), bucket, bucketEntry, oldValue = null;

            // Check if a bucket exists for the bucket key
            bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket)
            {
                // Check this bucket to see if it already contains this key
                bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry)
                {
                    // This bucket entry is the current mapping of key to value, so replace old value and we're done.
                    oldValue = bucketEntry[1];
                    bucketEntry[1] = value;
                } else
                {
                    // The bucket does not contain an entry for this key, so add one
                    bucket.addEntry(key, value);
                }
            } else
            {
                // No bucket exists for the key, so create one and put our key/value mapping in
                bucket = new Bucket(hash, key, value, equalityFunction);
                buckets[buckets.length] = bucket;
                bucketsByHash[hash] = bucket;
            }
            return oldValue;
        };

        this.get = function (key)
        {
            checkKey(key);

            var hash = hashingFunction(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);
            if (bucket)
            {
                // Check this bucket to see if it contains this key
                var bucketEntry = bucket.getEntryForKey(key);
                if (bucketEntry)
                {
                    // This bucket entry is the current mapping of key to value, so return the value.
                    return bucketEntry[1];
                }
            }
            return null;
        };

        this.containsKey = function (key)
        {
            checkKey(key);
            var bucketKey = hashingFunction(key);

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, bucketKey);

            return bucket ? bucket.containsKey(key) : false;
        };

        this.containsValue = function (value)
        {
            checkValue(value);
            var i = buckets.length;
            while (i--)
            {
                if (buckets[i].containsValue(value))
                {
                    return true;
                }
            }
            return false;
        };

        this.clear = function ()
        {
            buckets.length = 0;
            bucketsByHash = {};
        };

        this.isEmpty = function ()
        {
            return !buckets.length;
        };

        var createBucketAggregator = function (bucketFuncName)
        {
            return function ()
            {
                var aggregated = [], i = buckets.length;
                while (i--)
                {
                    buckets[i][bucketFuncName](aggregated);
                }
                return aggregated;
            };
        };

        this.keys = createBucketAggregator("keys");
        this.values = createBucketAggregator("values");
        this.entries = createBucketAggregator("getEntries");

        this.remove = function (key)
        {
            checkKey(key);

            var hash = hashingFunction(key), bucketIndex, oldValue = null;

            // Check if a bucket exists for the bucket key
            var bucket = getBucketForHash(bucketsByHash, hash);

            if (bucket)
            {
                // Remove entry from this bucket for this key
                oldValue = bucket.removeEntryForKey(key);
                if (oldValue !== null)
                {
                    // Entry was removed, so check if bucket is empty
                    if (!bucket.entries.length)
                    {
                        // Bucket is empty, so remove it from the bucket collections
                        bucketIndex = searchBuckets(buckets, hash);
                        arrayRemoveAt(buckets, bucketIndex);
                        delete bucketsByHash[hash];
                    }
                }
            }
            return oldValue;
        };

        this.size = function ()
        {
            var total = 0, i = buckets.length;
            while (i--)
            {
                total += buckets[i].entries.length;
            }
            return total;
        };

        this.each = function (callback)
        {
            var entries = that.entries(), i = entries.length, entry;
            while (i--)
            {
                entry = entries[i];
                callback(entry[0], entry[1]);
            }
        };

        this.putAll = function (hashtable, conflictCallback)
        {
            var entries = hashtable.entries();
            var entry, key, value, thisValue, i = entries.length;
            var hasConflictCallback = (typeof conflictCallback == FUNCTION);
            while (i--)
            {
                entry = entries[i];
                key = entry[0];
                value = entry[1];

                // Check for a conflict. The default behaviour is to overwrite the value for an existing key
                if (hasConflictCallback && (thisValue = that.get(key)))
                {
                    value = conflictCallback(key, thisValue, value);
                }
                that.put(key, value);
            }
        };

        this.clone = function ()
        {
            var clone = new Hashtable(hashingFunctionParam, equalityFunctionParam);
            clone.putAll(that);
            return clone;
        };

        /**
         * Added by martin@playcratlabs.com to support debug dumping of hash arrays
         */
        this.toString = function ()
        {
            var result = '';
            var keys = this.keys();
            for (var i = 0; i < keys.length; i++)
            {
                var obj = this.get(keys[i]);
                result += keys[i].toString() + ' = ' + obj.toString() + '\n';
            }

            return result;
        }
    }

    return Hashtable;
})();
/**
 * A map of linked lists mapped by a string value
 */
gamecore.HashList = gamecore.Base.extend('gamecore.HashList',
    {},
    {
        hashtable: null,

        init: function()
        {
            this.hashtable = new gamecore.Hashtable();
        },

        add: function(key, object)
        {
            // find the list associated with this key and add the object to it
            var list = this.hashtable.get(key);
            if (list == null)
            {
                // no list associated with this key yet, so let's make one
                list = new gamecore.LinkedList();
                this.hashtable.put(key, list);
            }
            list.add(object);
        },

        remove: function(key, object)
        {
            var list = this.hashtable.get(key);
            if (list == null) throw "No list for a key in hashlist when removing";
            list.remove(object);
        },

        get: function(key)
        {
            return this.hashtable.get(key);
        }


    });

/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * linkedlist.js
 * A high-perforance doubly-linked list intended for use in gaming
 */

/**
 * @class gamecore.LinkedNode
 * @extends gamecore.Base
 * Internal node storage class for gamecore.Linkedist
 * @see gamecore.LinkedList
 */
gamecore.LinkedListNode = gamecore.Base('gamecore.LinkedNode', {},
    {
        obj:null, // the object reference
        nextLinked:null, // link to next object in the list
        prevLinked:null, // link to previous object in the list
        free:true,

        next:function ()
        {
            return this.nextLinked;
        },

        object:function ()
        {
            return this.obj;
        },

        prev:function ()
        {
            return this.prevLinked;
        }

    });

/**
 * @class gamecore.LinkedList
 * @extends gamecore.Base
 *
 * A high-speed doubly linked list of objects. Note that for speed reasons (using a dictionary lookup of
 * cached nodes) there can only be a single instance of an object in the list at the same time. Adding the same
 * object a second time will result in a silent return from the add method.
 *
 * In order to keep a track of node links, an object must be able to identify itself with a getUniqueId() function.
 *
 * To add an item use:
 * <code>
 *   list.add(newItem);
 * </code>
 *
 * You can iterate using the first and next members, such as:
 * <code>
 *   var node = list.first;
 *   while (node)
 *   {
 *       node.object().DOSOMETHING();
 *       node = node.next();
 *   }
 * </code>
 *
 */

gamecore.LinkedList = gamecore.Base('gamecore.LinkedList',

    //
    // STATICS
    //
    {
    },
    //
    // INSTANCE
    //
    {
        first:null,
        last:null,
        count:0,
        objToNodeMap:null, // a quick lookup list to map linked list nodes to objects

        /**
         * Constructs a new linked list
         */
        init:function ()
        {
            this._super();
            this.objToNodeMap = new gamecore.Hashtable();
        },

        /**
         * Get the LinkedListNode for this object.
         * @param obj The object to get the node for
         */
        getNode:function (obj)
        {
            // objects added to a list must implement a getUniqueId which returns a unique object identifier string
            // or just extend gamecore.Base to get it for free
            return this.objToNodeMap.get(obj.getUniqueId());
        },

        /**
         * Adds a specific node to the list -- typically only used internally unless you're doing something funky
         * Use add() to add an object to the list, not this.
         */
        addNode:function (obj)
        {
            var node = new gamecore.LinkedNode();
            node.obj = obj;
            node.prevLinked = null;
            node.nextLinked = null;
            node.free = false;
            this.objToNodeMap.put(obj.getUniqueId(), node);
            return node;
        },

        /**
         * Add an item to the list
         * @param obj The object to add
         */
        add:function (obj)
        {
            var node = this.getNode(obj);
            if (node == null)
            {
                node = this.addNode(obj);
            } else
            {
                // if the object is already in the list just throw an (can't add an object more than once)
                // if you want to quickly check if an item is already in a list, then call list.has(obj)
                if (node.free == false)
                    throw 'Attempting to add object: ' + obj.getUniqueId() + ' twice to list ' + this.getUniqueId();

                // reusing a node, so we clean it up
                // this caching of node/object pairs is the reason an object can only exist
                // once in a list -- which also makes things faster (not always creating new node
                // object every time objects are moving on and off the list
                node.obj = obj;
                node.free = false;
                node.nextLinked = null;
                node.prevLinked = null;
            }

            // append this obj to the end of the list
            if (this.first == null) // is this the first?
            {
                this.first = node;
                this.last = node;
                node.nextLinked = null; // clear just in case
                node.prevLinked = null;
            } else
            {
                if (this.last == null)
                    throw "Hmm, no last in the list -- that shouldn't happen here";

                // add this entry to the end of the list
                this.last.nextLinked = node; // current end of list points to the new end
                node.prevLinked = this.last;
                this.last = node;            // new object to add becomes last in the list
                node.nextLinked = null;      // just in case this was previously set
            }
            this.count++;

            if (this.showDebug) this.dump('after add');
        },

        has:function (obj)
        {
            var node = this.getNode(obj);
            return !(node == null || node.free == true);
        },

        /**
         * Moves this item upwards in the list
         * @param obj
         */
        moveUp:function (obj)
        {
            this.dump('before move up');
            var c = this.getNode(obj);
            if (!c) throw "Oops, trying to move an object that isn't in the list";
            if (c.prevLinked == null) return; // already first, ignore

            // This operation makes C swap places with B:
            // A <-> B <-> C <-> D
            // A <-> C <-> B <-> D

            var b = c.prevLinked;
            var a = b.prevLinked;

            // fix last
            if (c == this.last)
                this.last = b;

            var oldCNext = c.nextLinked;

            if (a)
                a.nextLinked = c;
            c.nextLinked = b;
            c.prevLinked = b.prevLinked;

            b.nextLinked = oldCNext;
            b.prevLinked = c;

            // check to see if we are now first
            if (this.first == b)
                this.first = c;
        },

        /**
         * Moves this item downwards in the list
         * @param obj
         */
        moveDown:function (obj)
        {
            var b = this.getNode(obj);
            if (!b) throw "Oops, trying to move an object that isn't in the list";
            if (b.nextLinked == null) return; // already last, ignore

            // This operation makes B swap places with C:
            // A <-> B <-> C <-> D
            // A <-> C <-> B <-> D

            var c = b.nextLinked;
            this.moveUp(c.obj);

            // check to see if we are now last
            if (this.last == c)
                this.last = b;
        },

        sort:function (compare)
        {
            // take everything off the list and put it in an array
            var sortArray = [];
            var node = this.first;
            while (node)
            {
                sortArray.push(node.object());
                node = node.next();
            }

            this.clear();

            // sort it
            sortArray.sort(compare);

            // then put it back
            for (var i = 0; i < sortArray.length; i++)
                this.add(sortArray[i]);
        },

        /**
         * Removes an item from the list
         * @param obj The object to remove
         * @returns boolean true if the item was removed, false if the item was not on the list
         */
        remove:function (obj)
        {
            if (this.showDebug) this.dump('before remove of ' + obj);
            var node = this.getNode(obj);
            if (node == null || node.free == true)
                return false; // ignore this error (trying to remove something not there
            //throw ('Error: trying to remove a node (' + obj + ') that isnt on the list ');

            // pull this object out and tie up the ends
            if (node.prevLinked != null)
                node.prevLinked.nextLinked = node.nextLinked;
            if (node.nextLinked != null)
                node.nextLinked.prevLinked = node.prevLinked;

            // fix first and last
            if (node.prevLinked == null) // if this was first on the list
                this.first = node.nextLinked; // make the next on the list first (can be null)
            if (node.nextLinked == null) // if this was the last
                this.last = node.prevLinked; // then this nodes previous becomes last

            node.free = true;
            node.prevLinked = null;
            node.nextLinked = null;

            this.count--;
            if (this.showDebug) this.dump('after remove');

            return true;
        },

        /**
         * Clears the list out
         */
        clear:function ()
        {
            // sweep the list and free all the nodes
            var next = this.first;
            while (next != null)
            {
                next.free = true;
                next = next.nextLinked;
            }
            this.first = null;
            this.count = 0;
        },

        /**
         * @return number of items in the list
         */
        length:function ()
        {
            return this.count;
        },

        /**
         * Outputs the contents of the current list. Usually for debugging.
         */
        dump:function (msg)
        {
            this.debug('====================' + msg + '=====================');
            var a = this.first;
            while (a != null)
            {
                this.debug("{" + a.obj.toString() + "} previous=" + ( a.prevLinked ? a.prevLinked.obj : "NULL"));
                a = a.next();
            }
            this.debug("===================================");
            this.debug("Last: {" + (this.last ? this.last.obj : 'NULL') + "} " +
                "First: {" + (this.first ? this.first.obj : 'NULL') + "}");
        }

    });



/**
 * @class gamecore.Queue
 * @extends gamecore.LinkedList
 *
 * A high-speed queue based on offset arrays. 
 *
 * To add an item use:
 * <code>
 *   queue.push(newItem);
 * </code>
 *
 * To deque an item use:
 * <code>
 *   queue.unshift()
 *   //or
 *   queue.pop()
 * </code>
 *
 */

gamecore.Queue = gamecore.Base('gamecore.Queue',
	{},
	{
		queue: [],
		offset: 0,

		push: function(obj) {
			this.queue.push(obj);
		},
		pop: function() {
			// if the queue is empty, return undefined
          	if (this.queue.length == 0) return undefined;

          	// store the item at the front of the queue
          	var item = this.queue[this.offset];
          	//Remove memory footprint on very large sets
          	this.queue[this.offset] = null;

          	// increment the offset and remove the free space if necessary
          	if (++ this.offset * 2 >= this.queue.length){
           		this.queue  = this.queue.slice(this.offset);
            	this.offset = 0;
          	}

          	// return the dequeued item
          	return item;
		}
	}
);
/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * pool.js
 */

/**
 * @class gamecore.Pool
 * Easy (high-performance) object pooling
 *
 * A pool of objects for use in situations where you want to minimize object life cycling (and
 * subsequently garbage collection). It also serves as a very high speed, minimal overhead
 * collection for small numbers of objects.
 * <p>
 * This class maintains mutual an array of objects which are free. If you wish to maintain a list of both
 * free and used then see the gamecore.DualPool.
 * <p>
 * Pools are managed by class type, and will auto-expand as required. You can create a custom initial pool
 * size by deriving from the Pool class and statically overriding INITIAL_POOL_SIZE.
 * <p>
 * Keep in mind that objects that are pooled are not constructed; they are "reset" when handed out.
 * You need to "acquire" one and then reset its state, usually via a static create factory method.
 * <p>
 * Example:
 * <code>
 * Point = gamecore.Pooled('Point',
 * {
 *   // Static constructor
 *   create:function (x, y)
 *   {
 *      var n = this._super();
 *      n.x = x;
 *      n.y = y;
 *      return n;
 *   }
 * },
 * {
 *    x:0, y:0,   // instance
 *
 *    init: function(x, y)
 *    {
 *       this.x = x;
 *       this.y = y;
 *    }
 * }
 * </code>
 * To then access the object from the pool, use create, instead of new. Then release it.
 * <code>
 * var p = Point.create(100, 100);
 * // ... do something
 * p.release();
 * </code>
 *
 */

gamecore.Pool = gamecore.Base.extend('gamecore.Pool', {
    INITIAL_POOL_SIZE:1,

    pools:new gamecore.Hashtable(), // all your pools belong to us
    totalPooled:0,
    totalUsed:0,

    /**
     * Acquire an object from a pool based on the class[name]. Typically this method is
     * automatically called from
     * @param classType Class of object to create
     */
    acquire:function (classType, dual) {
        var pool = this.getPool(classType);
        if (pool == undefined || pool == null) {
            // create a pool for this type of class
            //this.info('Constructing a new pool for ' + classType.fullName + ' objects.');
            pool = new gamecore.Pool(classType, this.INITIAL_POOL_SIZE, dual);
            this.pools.put(classType.fullName, pool);
        }
        return pool.acquire();
    },

    /**
     * Releases an object back into it's corresponding object pool
     * @param pooledObj Object to return to the pool
     */
    release:function (pooledObj) {
        var pool = this.pools.get(pooledObj.Class.fullName);
        if (pool == undefined)
            throw "Oops, trying to release an object of type " + pooledObj.Class.fullName +
                " but no pool exists. Did you new an object instead of using create.";

        pool.release(pooledObj);
    },

    /**
     * Returns the pool associated with the given classType, or null if no pool currently exists
     */
    getPool:function (classType) {
        return this.pools.get(classType.fullName);
    },

    getStats:function () {
        var s = '',
            keys = this.pools.keys(),
            key,
                pool;

            for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                pool = this.pools.get(key);
                if (pool.dual) {
                    s += key + ' (free: ' + pool.freeList.length() + ' used: ' + pool.usedList.length() + ')\n';
                } else {
                    s += key + ': ' + pool.getStats() + '\n';
                }
            }
            return s;
        }
}, {
    dual:false,
    freeList:null,
    expansion:1,
    traces:null,

    /**
     * Constructs a pool using a base of objects passed in as an array.
     * @param classType Class name of the type of objects in the pool
     * @param initial Starting number of objects in the pool
     */
    init:function (classType, initial, dual) {
        if (typeof dual === 'boolean')
           this.dual = dual;

        this.classType = classType;

        if (this.dual) {
            this.usedList = new gamecore.LinkedList();
            this.freeList = new gamecore.LinkedList();
        } else {
            this._super();
            this.freeList = [];
        }

        // instantiate the initial objects for the pool
        this.expand(initial);
    },


    startTracing:function () {
        if (this.tracing) return;
        this.tracing = true;
        if (this.traces)
            this.traces.clear();
        else
            this.traces = new gamecore.Hashtable();
    },

    stopTracing:function () {
        this.tracing = false;
    },

    /**
     * Expand the pool of objects by constructing a bunch of new ones. The pool will
     * automatically expand itself by 10% each time it runs out of space, so generally you
     * shouldn't need to use this.
     * @param howMany Number of new objects you want to add
     */
    expand:function (howMany) {
        //debug: if you want to track expansion
        //this.debug('expanding ' + this.classType.fullName + ' by ' + howMany + ' total=' + gamecore.Pool.totalPooled);

        gamecore.Pool.totalPooled += howMany;
        for (var i = 0; i < howMany; i++) {
            if (this.dual) {
                this.freeList.add(new this.classType());
            } else {
                this.freeList.push(new this.classType());
            }
        }
    },

    getFreeCount:function () {
        return this.freeList.length;
    },

    /**
     * Returns the next free object by moving it from the free pool to the used
     * one. If no free objects are available it returns the oldest from the used
     * pool.
     * access to the object
     */
    returnObj:null,

    /**
     * Returns the next free object by moving it from the free pool to the used
     * one. If no free objects are available it returns the oldest from the used
     * pool.
     * access to the object
     */
    acquire:function () {
        // check if we have anymore to give out
        if (this.dual) {
            // check if we have anymore to give out
            if (this.freeList.first == null)
            // create some more space (expand by 20%, minimum 1)
                this.expand(Math.round(this.size() / 5) + 1);

            this.returnObj = this.freeList.first.obj;
            this.freeList.remove(this.returnObj);
            this.returnObj.destroyed = false;
            this.usedList.add(this.returnObj);
        } else {
            if (this.freeList.length <= 0) {
                // create some more space (expand by 20%, minimum 1)
                this.expansion = Math.round(this.expansion * 1.2) + 1;
                this.expand(this.expansion);
            }
        }

        if (this.tracing) {
            var stack = printStackTrace();
            var pos = stack.length - 1;
            while (stack[pos].indexOf('Class.addTo') == 0 && pos > 0)
                pos--;
            var count = this.traces.get(stack[pos]);
            if (count == null)
                this.traces.put(stack[pos], { value:1 });
            else
                count.value++;
        }

        return this.dual ? this.returnObj : this.freeList.pop();
    },

    /**
     * Releases an object by moving it from the used list back to the free list.
     * @param obj {pc.Base} The obj to release back into the pool
     */
    release:function (obj) {
        if (this.dual) {
            this.freeList.add(obj);
            this.usedList.remove(obj);
        } else {
            this.freeList.push(obj);
        }
    },

    getStats:function () {
        var s = this.Class.fullName + ' stats: ' + this.freeList.length + ' free.\n';

        if (this.tracing) {
            s += 'TRACING\n';
            var traceKeys = this.traces.keys();
            for (var k in traceKeys)
                s += traceKeys[k] + ' (' + this.traces.get(traceKeys[k]).value + ')\n';
        }
        return s;
    },

    dump:function (msg) {
        this.info('================== ' + msg + ' ===================');
        this.info('FREE');
        this.freeList.dump();
        if (this.dual) {
            this.info('USED');
            this.usedList.dump();
        }
    },

    /**
     * Returns the number of objects in the pool
     */
    size:function () {
        return this.dual ? this.freeList.count + this.usedList.count : this.freeList.length;
    },

    /**
     * Returns the LinkedList of currently free objects in the pool
     */
    getFreeList:function () {
        return this.freeList;
    },

    /**
     * Returns the LinkedList of current used objects in the pool
     * @return {*}
     */
    getUsedList:function () {
        return this.usedList;
    }
});

/**
 * @class gamecore.Pooled
 * Used as a base class for objects which are life cycle managed in an object pool.
 */
gamecore.Pooled = gamecore.Base('gamecore.Pooled', {
    /**
     * Static factory method for creating a new object based on its class. This method
     * should be called using this._super from the Class.create that derives from this.
     * @returns An object from the pool
     */
    create:function (dual) {
        return gamecore.Pool.acquire(this, dual);
    },
    getPool:function () {
        return gamecore.Pool.getPool(this);
    }
}, {
    destroyed:false,
    dual:false,
    init:function (dual) {
        this._super();
        if (typeof dual === 'boolean')
           this.dual = dual;
    },
    release:function () {
        this.onRelease();
        gamecore.Pool.release(this);
    },
    onRelease:function () {
    }
});
/**
 * gamecore.js - Copyright 2012 Playcraft Labs, Inc. (see licence.txt)
 * perf.js
 * Simple performance monitoring tools.
 */

/**
 * @class gamecore.PerformanceMeasure
 * Example:
 * <code>
 * var measure = new gamecore.PerformanceMeasure('A test');
 * // ... do something
 * console.log(measure.end()); // end returns a string you can easily log
 * </code>
 *
 * The memory count is an idea based on a delta of the useJSHeapSize exposed by Chrome.
 * You will need to restart Chrome with --enable-memory-info to have this exposed.
 * It is however, not very reliable as the value will jump around due to gc runs (I think).
 * So far it seems to produce reliable results that are consistent, however memStart > memEnd
 * cases still occur and it would be good to understand this more (is it limited only to GC
 * runs? if so, why is it so consistent?).
 */

gamecore.PerformanceMeasure = gamecore.Base.extend('gamecore.PerformanceMeasure',
{
    history: [],

    /**
     * Clears the performance history
     */
    clearHistory: function()
    {
        history.length = 0;
    }
},
{
    timeStart: 0,
    timeEnd: 0,
    timeDelat: 0,
    memStart: 0,
    memEnd: 0,
    memDelta: 0,
    description: null,

    /**
     * Constructs a new performance measure with description
     * @param description
     */
    init: function(description)
    {
        this.description = description;
        this.start();
        this.Class.history.push(this);
    },

    /**
     * Starts a performance measure
     */
    start: function()
    {
        this.timeStart = Date.now();
        this.memStart = gamecore.Device.getUsedHeap();
    },

    /**
     * Ends a performance measure, and for convenience returns a toString of the measurement
     * @return String representing the measurement
     */
    end: function()
    {
        this.timeEnd = Date.now();
        this.timeDelta = this.timeEnd - this.timeStart;
        this.memEnd = gamecore.Device.getUsedHeap();

        if (this.memEnd < this.memStart)
            this.memDelta = 0;
        else
            this.memDelta = this.memEnd - this.memStart;
        return this.toString();
    },

    /**
     * Reports the performance measurement in a nice clean way
     */
    toString: function()
    {
        return this.description + ' took ' + this.timeDelta + 'ms, ' +
            (this.memDelta == 0 ? 'unknown':this.memDelta) + ' byte(s)';
    }

});
// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)

/**
 * Main function giving a function stack trace with a forced or passed in Error
 *
 * @cfg {Error} e The error to create a stacktrace from (optional)
 * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
 * @return {Array} of Strings with functions, lines, files, and arguments where possible
 */
function printStackTrace(options) {
    options = options || {guess: true};
    var ex = options.e || null, guess = !!options.guess;
    var p = new printStackTrace.implementation(), result = p.run(ex);
    return (guess) ? p.guessAnonymousFunctions(result) : result;
}

printStackTrace.implementation = function() {
};

printStackTrace.implementation.prototype = {
    /**
     * @param {Error} ex The error to create a stacktrace from (optional)
     * @param {String} mode Forced mode (optional, mostly for unit tests)
     */
    run: function(ex, mode) {
        ex = ex || this.createException();
        // examine exception properties w/o debugger
        //for (var prop in ex) {alert("Ex['" + prop + "']=" + ex[prop]);}
        mode = mode || this.mode(ex);
        if (mode === 'other') {
            return this.other(arguments.callee);
        } else {
            return this[mode](ex);
        }
    },

    createException: function() {
        try {
            this.undef();
        } catch (e) {
            return e;
        }
    },

    /**
     * Mode could differ for different exception, e.g.
     * exceptions in Chrome may or may not have arguments or stack.
     *
     * @return {String} mode of operation for the exception
     */
    mode: function(e) {
        if (e['arguments'] && e.stack) {
            return 'chrome';
        } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
            // e.message.indexOf("Backtrace:") > -1 -> opera
            // !e.stacktrace -> opera
            if (!e.stacktrace) {
                return 'opera9'; // use e.message
            }
            // 'opera#sourceloc' in e -> opera9, opera10a
            if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                return 'opera9'; // use e.message
            }
            // e.stacktrace && !e.stack -> opera10a
            if (!e.stack) {
                return 'opera10a'; // use e.stacktrace
            }
            // e.stacktrace && e.stack -> opera10b
            if (e.stacktrace.indexOf("called from line") < 0) {
                return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
            }
            // e.stacktrace && e.stack -> opera11
            return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
        } else if (e.stack) {
            return 'firefox';
        }
        return 'other';
    },

    /**
     * Given a context, function name, and callback function, overwrite it so that it calls
     * printStackTrace() first with a callback and then runs the rest of the body.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to instrument
     * @param {Function} function to call with a stack trace on invocation
     */
    instrumentFunction: function(context, functionName, callback) {
        context = context || window;
        var original = context[functionName];
        context[functionName] = function instrumented() {
            callback.call(this, printStackTrace().slice(4));
            return context[functionName]._instrumented.apply(this, arguments);
        };
        context[functionName]._instrumented = original;
    },

    /**
     * Given a context and function name of a function that has been
     * instrumented, revert the function to it's original (non-instrumented)
     * state.
     *
     * @param {Object} context of execution (e.g. window)
     * @param {String} functionName to de-instrument
     */
    deinstrumentFunction: function(context, functionName) {
        if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
            context[functionName] = context[functionName]._instrumented;
        }
    },

    /**
     * Given an Error object, return a formatted Array based on Chrome's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    chrome: function(e) {
        var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
          replace(/^\s+(at eval )?at\s+/gm, '').
          replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
          replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
        stack.pop();
        return stack;
    },

    /**
     * Given an Error object, return a formatted Array based on Firefox's stack string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    firefox: function(e) {
        return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
    },

    opera11: function(e) {
        // "Error thrown at line 42, column 12 in <anonymous function>() in file://localhost/G:/js/stacktrace.js:\n"
        // "Error thrown at line 42, column 12 in <anonymous function: createException>() in file://localhost/G:/js/stacktrace.js:\n"
        // "called from line 7, column 4 in bar(n) in file://localhost/G:/js/test/functional/testcase1.html:\n"
        // "called from line 15, column 3 in file://localhost/G:/js/test/functional/testcase1.html:\n"
        var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var location = match[4] + ':' + match[1] + ':' + match[2];
                var fnName = match[3] || "global code";
                fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    opera10b: function(e) {
        // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
        // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
        // "@file://localhost/G:/js/test/functional/testcase1.html:15"
        var lineRE = /^(.*)@(.+):(\d+)$/;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i++) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[1]? (match[1] + '()') : "global code";
                result.push(fnName + '@' + match[2] + ':' + match[3]);
            }
        }

        return result;
    },

    /**
     * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
     *
     * @param e - Error object to inspect
     * @return Array<String> of function calls, files and line numbers
     */
    opera10a: function(e) {
        // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
        var lines = e.stacktrace.split('\n'), result = [];

        for (var i = 0, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                var fnName = match[3] || ANON;
                result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Opera 7.x-9.2x only!
    opera9: function(e) {
        // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
        // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
        var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
        var lines = e.message.split('\n'), result = [];

        for (var i = 2, len = lines.length; i < len; i += 2) {
            var match = lineRE.exec(lines[i]);
            if (match) {
                result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
            }
        }

        return result;
    },

    // Safari, IE, and others
    other: function(curr) {
        var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i, stack = [], fn, args, maxStackSize = 10;
        while (curr && curr['arguments'] && stack.length < maxStackSize) {
            fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
            args = Array.prototype.slice.call(curr['arguments'] || []);
            stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
            curr = curr.caller;
        }
        return stack;
    },

    /**
     * Given arguments array as a String, subsituting type names for non-string types.
     *
     * @param {Arguments} object
     * @return {Array} of Strings with stringified arguments
     */
    stringifyArguments: function(args) {
        var result = [];
        var slice = Array.prototype.slice;
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            if (arg === undefined) {
                result[i] = 'undefined';
            } else if (arg === null) {
                result[i] = 'null';
            } else if (arg.constructor) {
                if (arg.constructor === Array) {
                    if (arg.length < 3) {
                        result[i] = '[' + this.stringifyArguments(arg) + ']';
                    } else {
                        result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                    }
                } else if (arg.constructor === Object) {
                    result[i] = '#object';
                } else if (arg.constructor === Function) {
                    result[i] = '#function';
                } else if (arg.constructor === String) {
                    result[i] = '"' + arg + '"';
                } else if (arg.constructor === Number) {
                    result[i] = arg;
                }
            }
        }
        return result.join(',');
    },

    sourceCache: {},

    /**
     * @return the text from a given URL
     */
    ajax: function(url) {
        var req = this.createXMLHTTPObject();
        if (req) {
            try {
                req.open('GET', url, false);
                //req.overrideMimeType('text/plain');
                //req.overrideMimeType('text/javascript');
                req.send(null);
                //return req.status == 200 ? req.responseText : '';
                return req.responseText;
            } catch (e) {
            }
        }
        return '';
    },

    /**
     * Try XHR methods in order and store XHR factory.
     *
     * @return <Function> XHR function or equivalent
     */
    createXMLHTTPObject: function() {
        var xmlhttp, XMLHttpFactories = [
            function() {
                return new XMLHttpRequest();
            }, function() {
                return new ActiveXObject('Msxml2.XMLHTTP');
            }, function() {
                return new ActiveXObject('Msxml3.XMLHTTP');
            }, function() {
                return new ActiveXObject('Microsoft.XMLHTTP');
            }
        ];
        for (var i = 0; i < XMLHttpFactories.length; i++) {
            try {
                xmlhttp = XMLHttpFactories[i]();
                // Use memoization to cache the factory
                this.createXMLHTTPObject = XMLHttpFactories[i];
                return xmlhttp;
            } catch (e) {
            }
        }
    },

    /**
     * Given a URL, check if it is in the same domain (so we can get the source
     * via Ajax).
     *
     * @param url <String> source url
     * @return False if we need a cross-domain request
     */
    isSameDomain: function(url) {
        return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
    },

    /**
     * Get source code from given URL if in the same domain.
     *
     * @param url <String> JS source URL
     * @return <Array> Array of source code lines
     */
    getSource: function(url) {
        // TODO reuse source from script tags?
        if (!(url in this.sourceCache)) {
            this.sourceCache[url] = this.ajax(url).split('\n');
        }
        return this.sourceCache[url];
    },

    guessAnonymousFunctions: function(stack) {
        for (var i = 0; i < stack.length; ++i) {
            var reStack = /\{anonymous\}\(.*\)@(.*)/,
                reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                frame = stack[i], ref = reStack.exec(frame);

            if (ref) {
                var m = reRef.exec(ref[1]);
                if (m) { // If falsey, we did not get any file/line information
                    var file = m[1], lineno = m[2], charno = m[3] || 0;
                    if (file && this.isSameDomain(file) && lineno) {
                        var functionName = this.guessAnonymousFunction(file, lineno, charno);
                        stack[i] = frame.replace('{anonymous}', functionName);
                    }
                }
            }
        }
        return stack;
    },

    guessAnonymousFunction: function(url, lineNo, charNo) {
        var ret;
        try {
            ret = this.findFunctionName(this.getSource(url), lineNo);
        } catch (e) {
            ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
        }
        return ret;
    },

    findFunctionName: function(source, lineNo) {
        // FIXME findFunctionName fails for compressed source
        // (more than one function on the same line)
        // TODO use captured args
        // function {name}({args}) m[1]=name m[2]=args
        var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
        // {name} = function ({args}) TODO args capture
        // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
        var reFunctionExpression = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function\b/;
        // {name} = eval()
        var reFunctionEvaluation = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
        // Walk backwards in the source lines until we find
        // the line which matches one of the patterns above
        var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
        for (var i = 0; i < maxLines; ++i) {
            // lineNo is 1-based, source[] is 0-based
            line = source[lineNo - i - 1];
            commentPos = line.indexOf('//');
            if (commentPos >= 0) {
                line = line.substr(0, commentPos);
            }
            // TODO check other types of comments? Commented code may lead to false positive
            if (line) {
                code = line + code;
                m = reFunctionExpression.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
                m = reFunctionDeclaration.exec(code);
                if (m && m[1]) {
                    //return m[1] + "(" + (m[2] || "") + ")";
                    return m[1];
                }
                m = reFunctionEvaluation.exec(code);
                if (m && m[1]) {
                    return m[1];
                }
            }
        }
        return '(?)';
    }
};

