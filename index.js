;!function ($) {
    'use strict';
    
    var defaults = {
        theme           : '',
        arrow           : 7,
        type            : 'hover',  
        delay           : 200,
        item            : null,//子代绑定
        container       : null,
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

    var template = "<div class=\"ui-poptip\">\r\n    <div class=\"ui-poptip-container\">\r\n        <div class=\"ui-poptip-arrow\">\r\n            <em></em>\r\n            <span></span>\r\n        </div>\r\n        <div class=\"ui-poptip-content\" data-role=\"content\"></div>\r\n    </div>\r\n</div>"
    function Poptip(element, options) {
        this.element = $(element)
        // 提取 data 设置
        var dataApi = _getDataApi(this.element)

        this.settings = $.extend({}, defaults, dataApi, options)
        this._title = this.element.attr('title')
        this.mode = 'hide'
        this.timeout = null

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
            if (triggerType === 'none') {
                obj.show()
            }
            else if (triggerType === 'click') {
                $el.on('click.' + __plugName__, function(e) {
                    obj.toggle()
                })
                $(document).on('click.' + __plugName__, function(e) {
                    if (obj.mode == 'show' && e.target !== obj.element[0]) {
                        obj.hide()
                    }
                });
            } 
            else {
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
                this.tip_bubble = $(template).appendTo('body').hide();
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

            window.clearTimeout(obj.timeout)
            obj.timeout = null
            obj.tip_bubble && obj.tip_bubble.hide()
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
                ctn = bubble.find('[data-role="content"]'),
                content = settings.content

            if (msg != null) {
                content = msg + ''
            } 
            else if( $.isFunction(content) ) {
                content = content.call($el)
            }
            ctn && ctn.html(content)

            if (msg != null) {
                this.reposition()
            } 
            return this
        },
        reposition: function() {
            var arrow = parseInt(this.settings.arrow, 10),
                bubble = this.tip_bubble

            var positionMap = this._getPosition(arrow)

            positionMap = this._makesureInViewport( positionMap )

            this._renderArrow(positionMap.arrow)
            bubble.css( {
                left: positionMap.left,
                top: positionMap.top
            } )
            return this
        },
        destroy: function() {
            var $el = this.element

            $el.off('.' + __plugName__)
            $el.removeData(__plugName__)
            $el.attr('title', this._title)
            this.tip_bubble && this.tip_bubble.remove()
        },
        _getPosition: function(arrow) {
            var $el = this.element,
                bubble = this.tip_bubble,
                elPosi = $el.offset(),
                positionMap = {
                    arrow: arrow,
                    left: elPosi.left,
                    top: elPosi.top,
                    right: elPosi.left,
                    bottom: elPosi.top
                },
                direction = '',
                gap = 10,
                arrowShift = 0,
                w = bubble.outerWidth(),
                h = bubble.outerHeight()
            switch(arrow) {
                case 10:
                    direction = 'right'
                    break;
                case 11:
                    direction = 'bottom'
                    break;
                case 1:
                    direction = 'bottom'
                    arrowShift = $el.outerWidth() - w
                    break;
                case 2:
                    direction = 'left'
                    break;
                case 5:
                    direction = 'top'
                    arrowShift = $el.outerWidth() - w
                    break;
                default: // 7
                    direction = 'top'
            }

            switch(direction) {
                case 'top':
                    positionMap.top -= (h + gap)
                    positionMap.left +=  arrowShift
                    break;
                case 'bottom':
                    positionMap.top += ($el.outerHeight() + gap)
                    positionMap.left +=  arrowShift
                    break;
                case 'left':
                    positionMap.left -= ( w + gap )
                    break;
                case 'right':
                    positionMap.left += ( $el.outerWidth() + gap )
                    break;
            }

            positionMap.right = positionMap.left + w
            positionMap.bottom = positionMap.top + h

            return positionMap
        },
        _makesureInViewport: function (positionMap) {
            var direct = {
                    'left': 0,
                    'top': 1,
                    'right': 2,
                    'bottom': 3
                },
                verticalMap = {
                    '1': 5,
                    '5': 1,
                    '7': 11,
                    '11': 7
                },
                crossMap = {
                    '5': 7,
                    '7': 5,
                    '11': 1,
                    '1': 11,
                    '10': 2,
                    '2': 10
                },
                ap = positionMap.arrow,
                $container = this.settings.container ? $(this.settings.container) : null,
                rs = positionMap,
                changeAp,
                containment
            // $container
            if ($container && $container.length) {
                var posi = $container.offset(),
                    h =   $container.outerHeight(),
                    w = $container.outerWidth()  
                containment = [posi.left, posi.top, posi.left + w, posi.top + h]
            } else {
                // window
                var $win = $(window),
                    left = $win.scrollLeft(),
                    top = $win.scrollTop(),
                    h =   $win.outerHeight(),
                    w = $win.outerWidth()
                containment = [left, top, left + w, top + h]
            }
            // 纵向
            if ( (ap == 7 || ap == 5) && (containment[direct.top] > positionMap.top) ) {
                // tip 溢出屏幕上方
                ap = changeAp = verticalMap[ap]
            } else if( (ap == 11 || ap == 1) && (containment[direct.bottom] < positionMap.bottom) ) {
                // tip 溢出屏幕下方
                ap = changeAp = verticalMap[ap]
            }
            // 横向 // tip 溢出屏幕右边/左边
            if (containment[direct.right] < positionMap.right || containment[direct.left] > positionMap.left) {
                ap = changeAp = crossMap[ap]
            }

            if (changeAp) {
                rs = this._getPosition(changeAp)
            }

            // 上下切换后可能再左右溢出
            if (containment[direct.right] < positionMap.right) {
                rs = this._getPosition(2)
            }else if (containment[direct.left] > positionMap.left) {
                rs = this._getPosition(10)
            }
            
            return rs
        },
        _renderArrow: function(arrow) {
            var bubble = this.tip_bubble,
                prev = bubble.data('poptip-arrow-current')
            bubble.find('.ui-poptip-arrow').removeClass('ui-poptip-arrow-' + prev).addClass('ui-poptip-arrow-' + arrow)
            bubble.data('poptip-arrow-current', arrow)
        }
    })

    // PLUG 定义
    // ==========================
    function Plugin(option, params) {
        return this.each(function () {
            var $this = $(this),
                data  = $this.data(__plugName__)

            if (typeof option === 'object' && option.item)  {
                var triggerType = eventMap[option.type || defaults.type]
                $this.on(triggerType.showEvent, option.item, function(e) {
                    option.item = null
                    data = $(this).data(__plugName__)    
                    if (!data) {
                        $(this).data(__plugName__, (data = new Poptip(this, option) ) )
                        data.show()
                    }
                })
            } 
            else {
                if (!data) $this.data(__plugName__, (data = new Poptip(this, option) ) );

                if (typeof option === 'string') 
                    data[option](params)
            }
        })

    }

    $.fn.poptip = Plugin
    $.fn.poptip.Constructor = Poptip
}(jQuery);