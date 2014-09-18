var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Promise = require("montage/core/promise").Promise,
    logger = require("montage/core/logger").logger("substitution"),
    Compositor = require("ui/compositor").Compositor;

exports.Transition = Component.specialize({

   /* hasTemplate: {
        enumerable: false,
        value: false
    },*/

    constructor: {
        value: function Transition() {
            this._switchElements = Object.create(null);
            this._switchComponentTreeLoaded = Object.create(null);
            this._switchComponents = {};
        }
    },

    _allChildComponents: {
        value: null
    },

    deserializedFromTemplate: {
        value: function() {
            this._allChildComponents = this.childComponents.slice(0);

            if (this.switchValue) {
                this._loadSwitchComponentTree(this.switchValue);
            }
        }
    },

    _switchElements: {
        value: null
    },
    _switchComponentTreeLoaded: {
        value: null
    },

    /**
     * This method is used to dynamically add content to the substitution. This
     * is usually done by declaring the content in the template as the DOM
     * content of the substitution. However, in more advanced usages of the
     * substitution, this information might not be available at writing time.
     *
     * Throws when the `element` given has a parent node.
     *
     * @method
     * @param {string} key The key that identifies the content given, similar to
     *                 `data-arg` when declaring the content in the template.
     * @param {Node} element The element that will be shown when the `key` is
     *               the selected [switchValue]{@link Substitution#switchValue}.
     *               This element needs to be detached from the DOM and cannot
     *               have a parent node.
     */
    addSwitchElement: {
        value: function(key, element) {
            if (element.parentNode) {
                throw new Error("Can't handle elements inside the DOM.");
            }

            this._switchElements[key] = element;
            this._findFringeComponents(element, this._allChildComponents);
        }
    },

    _findFringeComponents: {
        value: function(element, components) {
            var nodes;

            components = components || [];

            if (element.component) {
                components.push(element.component);
            } else {
                nodes = element.children;
                for (var i = 0, node; node = nodes[i]; i++) {
                    this._findFringeComponents(node, components);
                }
            }

            return components;
        }
    },

    _drawnSwitchValue: {
        value: null
    },

    _switchValue: {
        value: null
    },

    switchValue: {
        get: function() {
            return this._switchValue;
        },
        set: function(value) {

            if (this._switchValue === value || this._isSwitchingContent) {
                return;
            }
            this._previousSwitchValue = this._switchValue;
            this._switchValue = value;

            // switchElements is only ready after the first draw
            // At first draw the substitution automatically draws what is in
            // the switchValue so we defer any content loading until the first
            // draw.
            if (!this._firstDraw && !this.isDeserializing) {
                this._loadContent(value);
            }
        }
    },

    enterDocument: {
        value: function(firstTime) {
            var argumentNames;

            //this.slot.enterDocument.apply(this, arguments);
            if (firstTime) {
                argumentNames = this.getDomArgumentNames();
                for (var i = 0, name; (name = argumentNames[i]); i++) {
                    this._switchElements[name] = this.extractDomArgument(name);
                }

                this._loadContent(this.switchValue);
                // TODO: Force the component to update its DOM now because the
                // updateComponentDom already happened for this draw cycle.
                // In the future the DrawManager will handle adding and
                // removing nodes from the DOM at any time before draw().
                this._updateComponentDom();
            }
        }
    },

    _setSlotContent: {
        value: function (slot, content) {
            // TODO: review this
            if (this._switchElements[content].component) {
                this._switchComponents[content] = this._switchElements[content].component;
            } else {
                this._switchElements[content] = this._switchComponents[content].element;
            }
            if (content === this._drawnSwitchValue) {
                slot.content = this.element.children[0];
            } else {
                slot.content = this._switchElements[content] || null;
            }
            if (!this._switchComponentTreeLoaded[content]) {
                this._loadSwitchComponentTree(content);
            }
        }
    },

    _isFirstTime: {
        value: true
    },

    _loadContent: {
        value: function(value) {
            var self = this;

            if (this._isFirstTime) {
                this._setSlotContent(this.mainSlot, value);
                this._isFirstTime = false;
            } else {
                this._setSlotContent(this.transitionSlot, value);
                if (this.transitions) {
                    if (this.transitions[this._previousSwitchValue] && this.transitions[this._previousSwitchValue].out) {
                        this.mainAnimationPlayer.source = this.transitions[this._previousSwitchValue].out;
                        this.transitions[this._previousSwitchValue].out.player = this.mainAnimationPlayer;
                        this.mainAnimationPlayer.finish();
                        this.mainAnimationPlayer.play();
                    }
                    if (this.transitions[value] && this.transitions[value].in) {
                        this.transitionAnimationPlayer.source = this.transitions[value].in;
                        this.transitions[value].in.player = this.transitionAnimationPlayer;
                        this.transitionAnimationPlayer.finish();
                        this.transitionAnimationPlayer.play();
                    }
                }
                setTimeout(function () {
                    self._setSlotContent(self.mainSlot, value);
                }, 2500);
            }
        }
    },

    /*contentDidChange: {
        value: function(newContent, oldContent) {
            this.super();
            if (this._drawnSwitchValue) {
                this._switchElements[this._drawnSwitchValue] = oldContent;
            }
            this._drawnSwitchValue = this._switchValue;
        }
    },*/

    _loadSwitchComponentTree: {
        value: function(value) {
            var self = this,
                childComponents = this._allChildComponents,
                element = this._switchElements[value],
                substitutionElement = this.element,
                canDrawGate = this.canDrawGate,
                component,
                currentElement,
                promises = [];

            if (!element) {
                element = this._getSubstitutionDomArgument(value);
            }

            for (var i = 0; i < childComponents.length; i++) {
                component = childComponents[i];
                currentElement = component.element;

                // Search the DOM tree up until we find the switch element or
                // the substitution element
                while (currentElement !== element &&
                       currentElement !== substitutionElement &&
                       currentElement.parentNode) {
                    currentElement = currentElement.parentNode;
                }
                // If we found the switch element before finding the
                // substitution element it means this component is inside the
                // selected switch value.
                if (currentElement === element) {
                    promises.push(component.loadComponentTree());
                }
            }

            if (promises.length > 0) {
                canDrawGate.setField(value + "ComponentTreeLoaded", false);

                Promise.all(promises).then(function() {
                    self._switchComponentTreeLoaded[value] = true;
                    canDrawGate.setField(value + "ComponentTreeLoaded", true);
                    self._canDraw = true;
                    self.needsDraw = true;
                }).done();
            } else {
                this._switchComponentTreeLoaded[value] = true;
                this.needsDraw = true;
            }
        }
    },

   /**
    * This function is used to get the dom arguments before the first draw,
    * _domArguments are only available at the first draw.
    * We need it before so we can start loading the component tree as soon as
    * possible without having to wait for the first draw.
    * @private
    */
    _getSubstitutionDomArgument: {
        value: function(name) {
            var candidates,
                node,
                element,
                elementId,
                serialization,
                labels,
                template = this._ownerDocumentPart.template;

            element = this.element;
            candidates = element.querySelectorAll("*[" + this.DOM_ARG_ATTRIBUTE + "='" + name + "']");

            // Make sure that the argument we find is indeed part of element and
            // not an argument from an inner component.
            nextCandidate:
            for (var i = 0, candidate; (candidate = candidates[i]); i++) {
                node = candidate;
                while ((node = node.parentNode) !== element) {
                    elementId = template.getElementId(node);

                    // Check if this node is an element of a component.
                    // TODO: Make this operation faster
                    if (elementId) {
                        serialization = template.getSerialization();
                        labels = serialization.getSerializationLabelsWithElements(
                            elementId);

                        if (labels.length > 0) {
                            // This candidate is inside another component so
                            // skip it.
                            continue nextCandidate;
                        }
                    }
                }
                return candidate;
            }
        }
    },

    /**
     * By default the substitution doesn't expand the entire component tree of
     * all its content, only of the content that needs to be shown.
     * This is an optimization to avoid loading all the content at page load
     * time.
     *
     * However, if for some reason it is desirable to load the entire content
     * at page load time this property can be set to `true`.
     *
     * @type {boolean}
     * @default false
     */
    shouldLoadComponentTree: {
        value: false
    },

    transition: {
        value: null
    },

    draw: {
        value: function () {
            if (Compositor.needsFoo) {
                Compositor.applyAnimatedValues();
                Compositor.needsFoo = false;
            }
            this.needsDraw = true;
        }
    }
});
