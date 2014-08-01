﻿/*! windows.js.mercury (v1.0.0) | © 2014 Andrew James (me@andyjames.it) | 
Released under the GNU General Public License, version 3 (GPL-3.0)
http://opensource.org/licenses/GPL-3.0 
*/
var $;
var windows;
windows = {
    settings: {
        enclosure: 'body',
        boundary: 0,
        maxToBoundary: true,
        speed: 200
    },
    presets: {
        default: {
            title: document.title,
            top: 30,
            left: 30,
            height: 500,
            width: 300,
            hide: true,
            state: true,
            close: true,
            movable: true,
            resizable: true,
            modal: false,
            icon: null
        },
        message: {
            title: document.title,
            top: 70,
            left: 70,
            height: 200,
            width: 400,
            hide: false,
            state: false,
            close: false,
            movable: false,
            resizable: false,
            modal: true,
            icon: null
        }
    },
    animatingWindows: [],
    maxedWindows: [],
    hiddenWindows: [],
    modalWindows: [],
    leftSnappedWindows: [],
    rightSnappedWindows: [],
    allWindows: [],
    activeWindow: {},
    snaps: {
        top: "top",
        left: "left",
        right: "right"
    },
    snapPossible: null,
    load: function (settings) {
        $.extend(windows.settings, settings);
        windows.settings.enclosure = $(windows.settings.enclosure);
        windows.settings.enclosure.addClass('win-js-enclosure');
        windows._internal.snapGuide = $('<div/>', { class: 'win-js-snap' });
        windows._internal.snapGuide.hide().appendTo(windows.settings.enclosure);
        $(window).mouseup(windows._internal.fn.globalMouseUp);
        $(window).mousemove(windows._internal.fn.globalMouseMove);
        $(window).resize(windows._internal.fn.globalResize);
    },
    open: function (settings, enclosure) {
        var ws = {};
        $.extend(ws, windows.presets.default);
        $.extend(ws, settings);
        if (enclosure == null) enclosure = windows.settings.enclosure;
        var win, modal, tb, tb_title, tb_staters, tb_hide, tb_state, tb_close, tb_icon, main;
        win = $('<div/>', { class: 'win-js-window', id: windows._internal.guid() });
        win.css({ top: ws.top, left: ws.left, width: ws.width, height: ws.height });
        $('<div/>', { class: 'win-js-border win-js-border-topleft' })
            .appendTo(win).mousedown(windows._internal.fn.borderTopLeftMouseDown);
        $('<div/>', { class: 'win-js-border win-js-border-topright' })
            .appendTo(win).mousedown(windows._internal.fn.borderTopRightMouseDown);
        $('<div/>', { class: 'win-js-border win-js-border-top' })
            .appendTo(win).mousedown(windows._internal.fn.borderTopMouseDown);
        $('<div/>', { class: 'win-js-border win-js-border-left' })
            .appendTo(win).mousedown(windows._internal.fn.borderLeftMouseDown);
        $('<div/>', { class: 'win-js-border win-js-border-right' })
            .appendTo(win).mousedown(windows._internal.fn.borderRightMouseDown);
        $('<div/>', { class: 'win-js-border win-js-border-bottomleft' })
            .appendTo(win).mousedown(windows._internal.fn.borderBottomLeftMouseDown);
        $('<div/>', { class: 'win-js-border win-js-border-bottomright' })
            .appendTo(win).mousedown(windows._internal.fn.borderBottomRightMouseDown);
        $('<div/>', { class: 'win-js-border win-js-border-bottom' })
            .appendTo(win).mousedown(windows._internal.fn.borderBottomMouseDown);
        main = $('<div/>', { class: 'win-js-main' }).appendTo(win);
        if (ws.movable) win.addClass('win-js-movable');
        tb = $('<div/>', { class: 'win-js-tb' }).appendTo(main);
        if (ws.icon) tb_icon = $('<img/>', { class: 'win-js-icon', src: ws.icon }).appendTo(tb);
        if (ws.close || ws.state || ws.hide) tb_staters = $('<div/>', { class: 'win-js-staters' }).appendTo(tb);
        if (ws.hide) tb_hide = $('<div/>', { class: 'win-js-hide' }).appendTo(tb_staters);
        if (ws.state) tb_state = $('<div/>', { class: 'win-js-state' }).appendTo(tb_staters);
        if (ws.close) tb_close = $('<div/>', { class: 'win-js-close' }).appendTo(tb_staters);
        tb_title = $('<div/>', { class: 'win-js-title', unselectable: 'on', text: ws.title }).appendTo(tb);
        $('<div/>', { class: 'win-js-clear' }).appendTo(tb);
        $('<div/>', { class: 'win-js-content' }).appendTo(main);
        if (ws.close) tb_close.click(windows._internal.fn.wintbCloseClick);
        if (ws.close && ws.icon) tb_icon.dblclick(windows._internal.fn.wintbCloseClick);
        if (ws.state) tb_state.click(windows._internal.fn.wintbMaxClick);
        if (ws.state) tb_title.dblclick(windows._internal.fn.wintbMaxClick);
        if (ws.hide) tb_hide.click(windows._internal.fn.wintbHideClick);
        if (ws.movable) tb_title.mousedown(windows._internal.fn.wintbMouseDown);
        win.mousedown(windows._internal.fn.winMouseDown);
        if (ws.modal) {
            modal = $('<div/>', { class: 'win-js-modal' });
            win.hide().appendTo(modal);
            modal.appendTo(enclosure);
            windows.modalWindows.push(win);
        } else {
            win.hide().appendTo(enclosure);
            windows.bringToFront(win);
        }
        windows.allWindows.push(win);
        windows.bringToFront(win);
        win.fadeIn(windows.settings.speed);
        return win;
    },
    max: function (win) {
        if (windows.isMaxedWindow(win)) return;
        if (windows.isLeftSnappedWindow(win)) {
            windows._internal.removeLeftSnappedWindow(win);
            win.removeClass('win-js-snapped-left');
        } else if (windows.isRightSnappedWindow(win)) {
            windows._internal.removeRightSnappedWindow(win);
            win.removeClass('win-js-snapped-right');
        }
        if (win.data('win-js-res-t') == null) win.data('win-js-res-t', win.offset().top);
        if (win.data('win-js-res-l') == null) win.data('win-js-res-l', win.offset().left);
        if (win.data('win-js-res-w') == null) win.data('win-js-res-w', win.width());
        if (win.data('win-js-res-h') == null) win.data('win-js-res-h', win.height());
        win.addClass('win-js-maxed');
        windows._internal.animateToMax(win);
        windows.maxedWindows.push(win);
    },
    snap: function (win, snap) {
        if (snap == windows.snaps.top) {
            windows.max(win);
            return;
        }
        if (snap != windows.snaps.left &&
            snap != windows.snaps.right)
            return;
        if (win.data('win-js-res-t') == null) win.data('win-js-res-t', win.offset().top);
        if (win.data('win-js-res-l') == null) win.data('win-js-res-l', win.offset().left);
        if (win.data('win-js-res-w') == null) win.data('win-js-res-w', win.width());
        if (win.data('win-js-res-h') == null) win.data('win-js-res-h', win.height());
        var snapPosition = windows._internal.getSnapPosition(snap);
        windows.animate(win, snapPosition);
        if (snap == windows.snaps.left) {
            windows.leftSnappedWindows.push(win);
            win.addClass('win-js-snapped-left');
        } else if (snap == windows.snaps.right) {
            windows.rightSnappedWindows.push(win);
            win.addClass('win-js-snapped-right');
        }
    },
    res: function (win) {
        windows.resTo(win, {
            top: win.data('win-js-res-t'),
            left: win.data('win-js-res-l'),
            width: win.data('win-js-res-w'),
            height: win.data('win-js-res-h')
        });
    },
    resTo: function (win, css) {
        if (windows.isMaxedWindow(win)) {
            windows._internal.removeMaxedWindow(win);
            win.removeClass('win-js-maxed');
        } else if (windows.isLeftSnappedWindow(win)) {
            windows._internal.removeLeftSnappedWindow(win);
            win.removeClass('win-js-snapped-left');
        } else if (windows.isRightSnappedWindow(win)) {
            windows._internal.removeRightSnappedWindow(win);
            win.removeClass('win-js-snapped-right');
        } else return;
        windows.animate(win.stop(), css,
            function () {
                win.data('win-js-res-t', null);
                win.data('win-js-res-l', null);
                win.data('win-js-res-w', null);
                win.data('win-js-res-h', null);
            });
    },
    hide: function (win) {
        if (windows.isHiddenWindow(win)) return;
        win.fadeOut(
            windows.settings.speed,
            function () {
                if (windows.isModalWindow(win)) {
                    win.parents('.win-js-modal').hide();
                }
            });
        windows.hiddenWindows.push(win);
    },
    show: function (win) {
        if (!windows.isHiddenWindow(win)) return;
        if (windows.isModalWindow(win)) {
            win.parents('.win-js-modal').show();
        }
        win.fadeIn(windows.settings.speed);
        windows._internal.removeHiddenWindow(win);
    },
    close: function (win) {
        win.fadeOut(
            windows.settings.speed,
            function () {
                if (windows.isModalWindow(win)) {
                    win.parents('.win-js-modal').remove();
                } else {
                    win.remove();
                }
                windows._internal.removeWindow(win);
            });
    },
    closeAll: function () {
        $.each(windows.allWindows, function (k, v) {
            windows.close(v);
        });
    },
    bringToFront: function (win) {
        var focus = win;
        if (windows.isModalWindow(win)) {
            focus = win.parents('.win-js-modal');
        }
        var winIndex = focus.css('z-index') - 1;
        $(windows.allWindows).each(function (k, v) {
            $(v).removeClass('win-js-active');
            var curIndex = $(v).css('z-index');
            if ($(v).css('z-index') > winIndex)
                $(v).css({ 'z-index': curIndex - 1 });
        });
        focus.css({ 'z-index': windows.allWindows.length });
        win.addClass('win-js-active');
        win.focus();
        windows.activeWindow = win;
    },
    animate: function (win, css, func) {
        if (win == null || css == null) return;
        if (windows.isAnimating(win)) win.stop();
        else windows.animatingWindows.push(win);
        win.addClass('win-js-animating');
        win.animate(css, windows.settings.speed, function () {
            windows._internal.removeAnimatingWindow(win);
            win.removeClass('win-js-animating');
            if (func != null) func.call(win);
        });
    },
    isAnimating: function (win) {
        var result = false;
        $.each(windows.animatingWindows, function (k, v) {
            if (v.is(win)) result = true;
        });
        return result;
    },
    isMaxedWindow: function (win) {
        var result = false;
        $.each(windows.maxedWindows, function (k, v) {
            if (v.is(win)) result = true;
        });
        return result;
    },
    isHiddenWindow: function (win) {
        var result = false;
        $.each(windows.hiddenWindows, function (k, v) {
            if (v.is(win)) result = true;
        });
        return result;
    },
    isModalWindow: function (win) {
        var result = false;
        $.each(windows.modalWindows, function (k, v) {
            if (v.is(win)) result = true;
        });
        return result;
    },
    isLeftSnappedWindow: function (win) {
        var result = false;
        $.each(windows.leftSnappedWindows, function (k, v) {
            if (v.is(win)) result = true;
        });
        return result;
    },
    isRightSnappedWindow: function (win) {
        var result = false;
        $.each(windows.rightSnappedWindows, function (k, v) {
            if (v.is(win)) result = true;
        });
        return result;
    },
    _internal: {
        snapGuide: null,
        transformingWindow: {
            curWindow: null,
            translationOffset: null,
            scalingAnchor: null
        },
        scalingAnchor: {
            top: "top",
            topLeft: "topLeft",
            topRight: "topRight",
            left: "left",
            right: "right",
            bottom: "bottom",
            bottomLeft: "bottomLeft",
            bottomRight: "bottomRight"
        },
        getTransformation: function (e) {
            var win = windows._internal.transformingWindow.curWindow;
            if (!win) return null;
            var boundary = parseInt(windows.settings.boundary);
            var currentDimensions = $.extend(win.offset(), {
                width: win.width(), height: win.height()
            });
            var transformation = {
                top: currentDimensions.top,
                left: currentDimensions.left,
                width: null,
                height: null
            }
            if (windows._internal.transformingWindow.translationOffset) {
                transformation.top = e.pageY - windows._internal.transformingWindow.translationOffset.top;
                transformation.left = e.pageX - windows._internal.transformingWindow.translationOffset.left;
                if (boundary != null) {
                    if (windows._internal.transformingWindow.translationOffset ||
                        windows._internal.transformingWindow.scalingAnchor == windows._internal.scalingAnchor.left ||
                        windows._internal.transformingWindow.scalingAnchor == windows._internal.scalingAnchor.top) {
                        if (transformation.top < -boundary) {
                            transformation.top = -boundary;
                            transformation.snap = windows.snaps.top;
                        }
                        if (transformation.left < -boundary) {
                            transformation.left = -boundary;
                            transformation.snap = windows.snaps.left;
                        }
                        if (transformation.left + currentDimensions.width > windows.settings.enclosure.width() + boundary) {
                            transformation.left = (windows.settings.enclosure.width() + boundary)
                                - windows._internal.transformingWindow.curWindow.width();
                            transformation.snap = windows.snaps.right;
                        }
                        if (transformation.top + currentDimensions.height > windows.settings.enclosure.height() + boundary) {
                            transformation.top = (windows.settings.enclosure.height() + boundary)
                                - windows._internal.transformingWindow.curWindow.height();
                        }
                    }
                }
            }
            if (windows._internal.transformingWindow.scalingAnchor) {
                switch (windows._internal.transformingWindow.scalingAnchor) {
                    case windows._internal.scalingAnchor.right:
                        transformation.width = e.pageX - currentDimensions.left;
                        break;
                    case windows._internal.scalingAnchor.bottom:
                        transformation.height = e.pageY - currentDimensions.top;
                        break;
                    case windows._internal.scalingAnchor.bottomRight:
                        transformation.width = e.pageX - currentDimensions.left;
                        transformation.height = e.pageY - currentDimensions.top;
                        break;
                    case windows._internal.scalingAnchor.top:
                        transformation.top = e.pageY;
                        transformation.height = currentDimensions.height + (currentDimensions.top - e.pageY);
                        break;
                    case windows._internal.scalingAnchor.left:
                        transformation.left = e.pageX;
                        transformation.width = currentDimensions.width + (currentDimensions.left - e.pageX);
                        break;
                    case windows._internal.scalingAnchor.topLeft:
                        transformation.top = e.pageY;
                        transformation.height = currentDimensions.height + (currentDimensions.top - e.pageY);
                        transformation.left = e.pageX;
                        transformation.width = currentDimensions.width + (currentDimensions.left - e.pageX);
                        break;
                    case windows._internal.scalingAnchor.topRight:
                        transformation.top = e.pageY;
                        transformation.height = currentDimensions.height + (currentDimensions.top - e.pageY);
                        transformation.width = e.pageX - currentDimensions.left;
                        break;
                    case windows._internal.scalingAnchor.bottomLeft:
                        transformation.height = e.pageY - currentDimensions.top;
                        transformation.left = e.pageX;
                        transformation.width = currentDimensions.width + (currentDimensions.left - e.pageX);
                }
                if (boundary != null) {
                    var enclosureDimensions =  {
                        width: windows.settings.enclosure.width(),
                        height: windows.settings.enclosure.height()
                    }
                    if (transformation.left < -boundary) {
                        transformation.left = -boundary;
                        transformation.width = currentDimensions.width + (currentDimensions.left - -boundary);
                    }
                    if (transformation.top < -boundary) {
                        transformation.top = -boundary;
                        transformation.height = currentDimensions.height + (currentDimensions.top - -boundary);
                    }
                    if (transformation.left + transformation.width > enclosureDimensions.width + (boundary * 2)) {
                        transformation.width = enclosureDimensions.width - transformation.left + (boundary * 2);
                    }
                    if (transformation.top + transformation.height > enclosureDimensions.height + (boundary * 2)) {
                        transformation.height = enclosureDimensions.height - transformation.top + (boundary * 2);
                    }
                }
            }
            return transformation;
        },
        getSnapPosition: function (snap) {
            var boundary = parseInt(windows.settings.boundary);
            var activeWidth = windows.settings.enclosure.width();
            var activeHeight = windows.settings.enclosure.height();
            var leftSnap = 0;
            var topSnap = 0;
            if (windows.settings.maxToBoundary) {
                if (boundary != null) {
                    activeWidth = activeWidth + (boundary * 2);
                    activeHeight = activeHeight + (boundary * 2);
                    leftSnap = leftSnap - boundary;
                    topSnap = topSnap - boundary;
                }
            }
            switch (snap) {
                case windows.snaps.top:
                    return {
                        left: leftSnap,
                        top: topSnap,
                        width: activeWidth,
                        height: activeHeight
                    };
                    break;
                case windows.snaps.left:
                    return {
                        left: leftSnap,
                        top: topSnap,
                        width: activeWidth / 2,
                        height: activeHeight
                    };
                    break;
                case windows.snaps.right:
                    return {
                        left: leftSnap + activeWidth / 2,
                        top: topSnap,
                        width: activeWidth / 2,
                        height: activeHeight
                    };
                    break;
                default:
                    return null;
            }
        },
        updateSnapGuide: function (win, snap) {
            if (snap && !windows.snapPossible && !windows.isAnimating(win)) {
                windows.snapPossible = snap;
                var winOffset = win.offset();
                var guidePosition = windows._internal.getSnapPosition(snap);
                windows._internal.snapGuide.stop().css({
                    opacity: 1,
                    left: winOffset.left,
                    top: winOffset.top,
                    width: win.width(),
                    height: win.height()
                }).show().animate(guidePosition, windows.settings.speed);
            } else if (!snap && windows.snapPossible) {
                windows.snapPossible = null;
                windows._internal.snapGuide.fadeOut();
            }
        },
        animateToMax: function (win) {
            win.stop();
            var top = windows.settings.enclosure.offset().top;
            var left = windows.settings.enclosure.offset().left;
            var width = windows.settings.enclosure.width() - parseInt(win.css('border-left-width'))
                - parseInt(win.css('border-right-width')) - parseInt(win.css('padding-left')) - parseInt(win.css('padding-right'));
            var height = windows.settings.enclosure.height() - parseInt(win.css('border-top-width'))
                - parseInt(win.css('border-bottom-width')) - parseInt(win.css('padding-top')) - parseInt(win.css('padding-top'));
            if (windows.settings.maxToBoundary) {
                var boundary = parseInt(windows.settings.boundary);
                if (boundary != null) {
                    top = top - boundary;
                    left = left - boundary;
                    width = width + 2 * boundary;
                    height = height + 2 * boundary;
                }
            }
            windows.animate(win, {
                top: top,
                left: left,
                width: width,
                height: height
            });
        },
        removeAnimatingWindow: function (win) {
            $.each(windows.animatingWindows, function (k, v) {
                if (v.is(win)) windows.animatingWindows.splice(k, 1);
            });
        },
        removeMaxedWindow: function (win) {
            $.each(windows.maxedWindows, function (k, v) {
                if (v.is(win)) windows.maxedWindows.splice(k, 1);
            });
        },
        removeHiddenWindow: function (win) {
            $.each(windows.hiddenWindows, function (k, v) {
                if (v.is(win)) windows.hiddenWindows.splice(k, 1);
            });
        },
        removeModalWindow: function (win) {
            $.each(windows.modalWindows, function (k, v) {
                if (v.is(win)) windows.modalWindows.splice(k, 1);
            });
        },
        removeLeftSnappedWindow: function (win) {
            $.each(windows.leftSnappedWindows, function (k, v) {
                if (v.is(win)) windows.leftSnappedWindows.splice(k, 1);
            });
        },
        removeRightSnappedWindow: function (win) {
            $.each(windows.rightSnappedWindows, function (k, v) {
                if (v.is(win)) windows.rightSnappedWindows.splice(k, 1);
            });
        },
        removeWindow: function (win) {
            windows._internal.removeModalWindow(win);
            windows._internal.removeHiddenWindow(win);
            windows._internal.removeMaxedWindow(win);
            windows._internal.removeLeftSnappedWindow(win);
            windows._internal.removeRightSnappedWindow(win);
            $.each(windows.allWindows, function (k, v) {
                if (v.is(win)) windows.allWindows.splice(k, 1);
            });
        },
        setAsScaling: function (win, anchor) {
            win.addClass('win-js-resizing');
            windows._internal.transformingWindow.curWindow = win;
            windows._internal.transformingWindow.scalingAnchor = anchor;
        },
        setAsTranslating: function (win, topOffset, leftOffset) {
            win.addClass('win-js-moving');
            windows._internal.transformingWindow.curWindow = win;
            windows._internal.transformingWindow.translationOffset = {
                top: topOffset, left: leftOffset
            }
        },
        guid: function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },
        fn: {
            borderTopMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.top);
            },
            borderTopLeftMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.topLeft);
            },
            borderTopRightMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.topRight);
            },
            borderLeftMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.left);
            },
            borderRightMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.right);
            },
            borderBottomMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.bottom);
            },
            borderBottomLeftMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.bottomLeft);
            },
            borderBottomRightMouseDown: function () {
                var win = $(this).parents('.win-js-window');
                windows._internal.setAsScaling(win, windows._internal.scalingAnchor.bottomRight);
            },
            wintbMouseDown: function(e) {
                var win = $(this).parents('.win-js-window');
                var swot = win.offset();
                windows._internal.setAsTranslating(win,
                        //todo: check this line, as this looks dodgy.
                        e.pageY - swot.top < 5 ? 5 : e.pageY - swot.top,
                        windows.isMaxedWindow(win) ? win.data('win-js-res-w') / 2 : e.pageX - swot.left
                );
                windows.bringToFront(win);
                return false;
            },
            winMouseDown: function() {
                windows.bringToFront($(this));
            },
            wintbCloseClick: function () {
                var win = $(this).parents('.win-js-window');
                windows.close(win);
            },
            wintbMaxClick: function () {
                var win = $(this).parents('.win-js-window');
                if (windows.isMaxedWindow(win)) windows.res(win);
                else windows.max(win);
            },
            wintbHideClick: function () {
                var win = $(this).parents('.win-js-window');
                windows.hide(win);
            },
            globalMouseUp: function () {
                if (windows._internal.transformingWindow.curWindow == null) return;
                var win = windows._internal.transformingWindow.curWindow;
                win.removeClass('win-js-moving');
                win.removeClass('win-js-resizing');
                if (windows.snapPossible == windows.snaps.top) {
                    windows.max(win);
                } else {
                    windows.snap(win, windows.snapPossible);
                }
                windows.snapPossible = null;
                windows._internal.snapGuide.fadeOut();
                windows._internal.transformingWindow.curWindow = null;
                windows._internal.transformingWindow.scalingAnchor = null;
                windows._internal.transformingWindow.translationOffset = null;
            },
            globalMouseMove: function (e) {
                var transformation = windows._internal.getTransformation(e);
                if (!transformation) return;
                var win = windows._internal.transformingWindow.curWindow;
                windows.resTo(win, {
                    width: win.data('win-js-res-w'),
                    height: win.data('win-js-res-h')
                });
                win.css({
                    top: transformation.top,
                    left: transformation.left,
                    width: transformation.width,
                    height: transformation.height
                });
                windows._internal.updateSnapGuide(win, transformation.snap);
            },
            globalResize: function () {
                for (var i = 0; i < windows.maxedWindows.length; i++)
                    windows._internal.animateToMax(windows.maxedWindows[i]);
                for (var i = 0; i < windows.leftSnappedWindows.length; i++)
                    windows.animate(windows.leftSnappedWindows[i], windows._internal.getSnapPosition(windows.snaps.left));
                for (var i = 0; i < windows.rightSnappedWindows.length; i++)
                    windows.animate(windows.rightSnappedWindows[i], windows._internal.getSnapPosition(windows.snaps.right));
            }
        }
    }
};
$.fn.openWindow = function(settings) {
    return windows.open(settings, $(this));
};