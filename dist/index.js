;!function ($) {
    'use strict';
    
    var defaults = {
		theme           : '',
		arrow           : 7,
        type            : 'hover',  
		delay           : 200,
		content         : null,
		onBeforeShow    : null,
		onShow          : null,
		onHide          : null
    }

    var eventMap = {
        hover: {
            showEvent: 'mouseover',
            hideEvent: 'mouseout'
        },
        focus: {
            showEvent: 'focus',
            hideEvent: 'blur'
        }
    }

    var __plugName__ = 'tc.poptip'

    var template = '' + "<div class=\"ui-poptip\">\r\n    <div class=\"ui-poptip-container\">\r\n        <div class=\"ui-poptip-arrow\">\r\n            <em></em>\r\n            <span></span>\r\n        </div>\r\n        <div class=\"ui-poptip-content\" data-role=\"content\"></div>\r\n    </div>\r\n</div>"

    function Poptip(element, options) {
    	this.element = $(element)
        // 提取 data 设置
        var dataApi = _getDataApi(this.element)

    	this.settings = $.extend({}, defaults, dataApi, options)
    	this._title = this.element.attr('title')
        this.mode = 'hide'

    	this.init()
    }

    function _getDataApi($element) {
        var ret = {},
            data = $element.data(),
            prop, 
            val
        if (data) {
            for(prop in data) {
                if (prop.substr(0, 6) === 'poptip') {
                    val = data[prop]
                    prop = prop.substr(6).toLowerCase()
                    if (defaults[prop]) {
                        ret[prop] = val
                    }
                }
            } 
        }
        return ret       
    }
    $.extend(Poptip.prototype, {
    	init: function() {
    		var obj = this,
    			$el = this.element,
                triggerType = this.settings.type

            $el.removeAttr('title')
            if (triggerType === 'click') {
                $el.on('click.' + __plugName__, function(e) {
                    obj.toggle()
                })
                $(document).on('click.' + __plugName__, function(e) {
                    if (obj.mode == 'show' && e.target !== obj.element[0]) {
                        obj.hide()
                    }
                });
            } else {
                var eventObj = eventMap[triggerType] || eventMap['hover']
        		$el.on(eventObj.showEvent + '.' + __plugName__, function() {
        			obj.show()
        		})
        		$el.on(eventObj.hideEvent + '.' + __plugName__, function() {
        			obj.hide()
        		})
            }
    	},
        _bubble: function() {
            if (!this.tip_bubble) {
                this.tip_bubble = $(template).appendTo('body');
            }
            return this.tip_bubble
        },
    	show: function() {
            var obj = this
            if (obj.mode == 'hide') {
                var bubble = obj._bubble()
                obj.content().reposition()

                $.isFunction(obj.settings.onBeforeShow) && obj.settings.onBeforeShow( obj )

                obj.timeout = window.setTimeout(function() {
                    bubble.show()
                    $.isFunction(obj.settings.onShow) && obj.settings.onShow( obj )
                    obj.mode = 'show'
                }, obj.settings.delay)
            }
    	},
        hide: function() {
            var obj = this

            window.clearTimeout(obj.timeout);
            obj.timeout = null;
            obj.tip_bubble.hide()
            $.isFunction(obj.settings.onHide) && obj.settings.onHide( obj )
            obj.mode = 'hide'
        },
        toggle: function() {
            this.mode == 'hide' ? this.show() : this.hide()
        },
        content: function(msg) {
            var bubble = this._bubble(),
                $el = this.element,
                settings = this.settings,
                ctn = bubble.find('[data-role="content"]')

            if (msg != null) {
                settings.content = msg + ''
            } 
            if (settings.content === null) {
                settings.content = $el.data('poptip-content')
            }
            ctn && ctn.html(settings.content)

            if (msg != null) {
                this.reposition()
            } 
            return this
        },
        reposition: function() {
            var $el = this.element,
                elPosi = $el.offset(),
                bubble = this.tip_bubble,
                settings = this.settings,
                arrow = parseInt(settings.arrow, 10),
                positionMap = {
                    left: $el.offset().left,
                    top: $el.offset().top
                }

            bubble.find('.ui-poptip-arrow').addClass('ui-poptip-arrow-' + arrow)

            var direction = '',
                gap = 10,
                arrowShift = 0;

            switch(arrow) {
                case 10:
                    direction = 'right'
                    break;
                case 11:
                    direction = 'bottom'
                    break;
                case 1:
                    direction = 'bottom'
                    arrowShift = $el.outerWidth() - bubble.outerWidth()
                    break;
                case 2:
                    direction = 'left'
                    break;
                case 5:
                    direction = 'top'
                    arrowShift = $el.outerWidth() - bubble.outerWidth()
                    break;
                default: // 7
                    direction = 'top'
            }

            switch(direction) {
                case 'top':
                    positionMap.top -= (bubble.outerHeight() + gap)
                    positionMap.left +=  arrowShift
                    break;
                case 'bottom':
                    positionMap.top += ($el.outerHeight() + gap)
                    positionMap.left +=  arrowShift
                    break;
                case 'left':
                    positionMap.left -= ( bubble.outerWidth() + gap )
                    break;
                case 'right':
                    positionMap.left += ( $el.outerWidth() + gap )
                    break;
            }
            
            bubble.css( positionMap )

            return this
        },
        destroy: function() {
            var $el = this.element

            $el.off('.' + __plugName__)
            $el.removeData(__plugName__)
            $el.attr('title', this._title)
        }
    })

    // PLUG 定义
    // ==========================
    function Plugin(option, params) {
        this.each(function () {
            var $this = $(this),
                data  = $this.data(__plugName__),
                options

            if (typeof option === 'object') 
                options = option

            if (!data) $this.data(__plugName__, (data = new Poptip(this, options) ) );

            if (typeof option === 'string') 
                data[option](params)
        })
    }

    $.fn.poptip = Plugin
    $.fn.poptip.Constructor = Poptip
}(jQuery);