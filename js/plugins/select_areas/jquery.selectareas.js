var clicked_id
var colors_ = ['#ecf0f1', '#e67e22', '#81ecec', '#b2bec3', '#f9ca24', '#ff7979', '#4cd137', '#e84118', '#00a8ff', '#9c88ff', '#ffffff', '#78e08f', '#079992', '#DCDCDC', '#00CED1', '#00FFFF', '#1E90FF', '#7B68EE', '#9370DB', '#FFEFD5', '#F0E68C', '#FF69B4', '#FFC0CB', '#ADD8E6', '#FF8C00', '#008B8B', '#E6E6FA', '#FFF0F5', '#FFFFF0', '#F0FFFF', '#FFFAFA'];
// (function($) {


$.imageArea = function (parent, id) {
    var dropdown_val = ''
    if(parent.areas().length > 0){
      if(parent.areas()[id])
      {
        dropdown_val = parent.areas()[id]["dropdown_value"] ?parent.areas()[id]["dropdown_value"] : ''
      }
      else{
     
      }
    }
    var options = parent.options,
        $image = parent.$image,
        $trigger = parent.$trigger,
        $outline,
        $selection,
        $countg,
        $add_p,
        $numb,
        $addLine,
        $resizeHandlers = {},
        $btDelete,
        resizeHorizontally = true,
        resizeVertically = true,
        selectionOffset = [0, 0],
        selectionOrigin = [0, 0],
        area = {
            id: id,
            x: 0,
            y: 0,
            z: 0,
            height: 10,
            width: 10,
            type: 'value',
            page: $image[0].alt,
            dropdown_value :dropdown_val
        },
        blur = function () {
            area.z = 0;
            refresh("blur");
        },
        focus = function () {
            parent.blurAll();
            area.z = 100;
            refresh();
        },
        getData = function () {
            return area;
        },
        fireEvent = function (event) {
            $image.trigger(event, [area.id, parent.areas()]);
        },
        cancelEvent = function (e) {
            var event = e || window.event || {};
            event.cancelBubble = true;
            event.returnValue = false;
            event.stopPropagation && event.stopPropagation(); // jshint ignore: line
            event.preventDefault && event.preventDefault(); // jshint ignore: line
        },
        off = function () {
            $.each(arguments, function (key, val) {
                on(val);
            });
        },
        on = function (type, handler) {
            var browserEvent, mobileEvent;
            switch (type) {
                case "start":
                    browserEvent = "mousedown";
                    mobileEvent = "touchstart";
                    break;
                case "move":
                    browserEvent = "mousemove";
                    mobileEvent = "touchmove";
                    break;
                case "stop":
                    browserEvent = "mouseup";
                    mobileEvent = "touchend";
                    break;
                default:
                    return;
            }
            if (handler && jQuery.isFunction(handler)) {
                $(window.document).on(browserEvent, handler).on(mobileEvent, handler);
            } else {
                $(window.document).off(browserEvent).off(mobileEvent);
            }
        },
        updateSelection = function () {
            // Update the outline layer
            $outline.css({
                cursor: "default",
                width: area.width,
                height: area.height,
                left: area.x,
                top: area.y,
                "z-index": area.z
            });

            // Update the selection layer
            $selection.css({
                backgroundPosition: (-area.x - 1) + "px " + (-area.y - 1) + "px",
                cursor: options.allowMove ? "move" : "default",
                width: (area.width - 2 > 0) ? (area.width - 2) : 0,
                height: (area.height - 2 > 0) ? (area.height - 2) : 0,
                left: area.x + 1,
                top: area.y + 1,
                "z-index": area.z + 2
            });
            if (options.keyShow) {
                var id__ = -1;
                parent.areas().some(function (el, i) {
                    if (el.id == area.id) {
                        id__ = i;
                        return true;
                    }
                });


                // if (id__ == 0) {
                //     area.type = 'value'
                // }
                // else if (id__ > 0) {
                //     area.type = 'keyword'
                // }
                tx = area.type == 'value' ? 'v' : 'k';

               // if(area.type == "value"){
               //     tx = 'v'
               // }
                //else{
                    //if(area.dropdown_value  == "context"){
                     // tx = 'c'
                    //}
                    //else{
                     //   tx = 'k'
                   // }
               // }

                // $(".select-count"+area.id).html(tx);
                $(".select-count" + area.id).css({
                    "left": (area.x - 15) + "px ",
                    "top": (area.y - 15) + "px ",
                    position: "absolute",
                    cursor: "default",
                    background: "white",
                    display: "inline",
                    padding: "8px 5px",
                    "line-height": "0px",
                    "border-radius": "50%",
                    "text-align": "center",
                }).html(tx);

            }

            if (options.addPlus) {
                $('.add_plus' + area.id).css({
                    "left": (area.x + area.width) + "px ",
                    "top": (area.y + area.height) + "px ",
                    display: "inline"
                })

            }
            if (options.numbering) {
                $('.numb_key' + area.id).css({
                    "left": (area.x) + "px " ,
                    "top": (area.y + area.height) + "px ",
                    // "background": colors_[area.id],
                    display: "inline"
                })
            }
        },
        updateResizeHandlers = function (show) {
            if (!options.allowResize) {
                return;
            }
            if (show) {
                $.each($resizeHandlers, function (name, $handler) {
                    var top,
                        left,
                        semiwidth = Math.round($handler.width() / 2),
                        semiheight = Math.round($handler.height() / 2),
                        vertical = name[0],
                        horizontal = name[name.length - 1];

                    if (vertical === "n") { // ====== North* ======
                        top = -semiheight;

                    } else if (vertical === "s") { // ====== South* ======
                        top = area.height - semiheight - 1;

                    } else { // === East & West ===
                        top = Math.round(area.height / 2) - semiheight - 1;
                    }

                    if (horizontal === "e") { // ====== *East ======
                        left = area.width - semiwidth - 1;

                    } else if (horizontal === "w") { // ====== *West ======
                        left = -semiwidth;

                    } else { // == North & South ==
                        left = Math.round(area.width / 2) - semiwidth - 1;
                    }

                    $handler.css({
                        display: "block",
                        left: area.x + left,
                        top: area.y + top,
                        "z-index": area.z + 1
                    });

                });
            } else {
                $(".select-areas-resize-handler").each(function () {
                    $(this).css({
                        display: "none"
                    });
                });
            }
        },
        updateBtDelete = function (visible) {
            if ($btDelete) {
                $btDelete.css({
                    left: area.x + area.width,
                    top: area.y - $btDelete.outerHeight(),
                    "z-index": area.z + 1
                });

            }
        },
        updateCursor = function (cursorType) {
            $outline.css({
                cursor: cursorType
            });

            $selection.css({
                cursor: cursorType
            });
        },
        refresh = function (sender) {
            switch (sender) {
                case "startSelection":
                    parent._refresh();
                    updateSelection();
                    updateResizeHandlers();
                    updateBtDelete(true);
                    break;

                case "pickSelection":
                case "pickResizeHandler":
                    updateResizeHandlers();
                    break;

                case "resizeSelection":
                    updateSelection();
                    updateResizeHandlers();
                    updateCursor("crosshair");
                    updateBtDelete(true);
                    break;

                case "moveSelection":
                    updateSelection();
                    updateResizeHandlers();
                    updateCursor("move");
                    updateBtDelete(true);
                    break;

                case "blur":
                    updateSelection();
                    updateResizeHandlers();
                    updateBtDelete();
                    break;

                    //case "releaseSelection":
                default:
                    updateSelection();
                    updateResizeHandlers(true);
                    updateBtDelete(true);
            }
        },
        startSelection = function (event) {
            cancelEvent(event);

            // Reset the selection size
            area.width = options.minSize[0];
            area.height = options.minSize[1];

            if (parent.areas().length > 1 && options.keyShow) {
                if (parent.areas()[0].type == 'value') {
                    area.type = 'keyword'
                } else {
                    area.type = 'value'
                }
            }
            focus();
            on("move", resizeSelection);
            on("stop", releaseSelection);

            // Get the selection origin
            selectionOrigin = getMousePosition(event);
            if (selectionOrigin[0] + area.width > $image.width()) {
                selectionOrigin[0] = $image.width() - area.width;
            }
            if (selectionOrigin[1] + area.height > $image.height()) {
                selectionOrigin[1] = $image.height() - area.height;
            }
            // And set its position
            area.x = selectionOrigin[0];
            area.y = selectionOrigin[1];
            refresh("startSelection");
        },
        pickSelection = function (event) {
            cancelEvent(event);
            focus();
            on("move", moveSelection);
            on("stop", releaseSelection);

            var mousePosition = getMousePosition(event);

            // Get the selection offset relative to the mouse position
            selectionOffset[0] = mousePosition[0] - area.x;
            selectionOffset[1] = mousePosition[1] - area.y;

            refresh("pickSelection");
        },
        pickResizeHandler = function (event) {
            cancelEvent(event);
            focus();

            var card = event.target.className.split(" ")[1];
            if (card[card.length - 1] === "w") {
                selectionOrigin[0] += area.width;
                area.x = selectionOrigin[0] - area.width;
            }
            if (card[0] === "n") {
                selectionOrigin[1] += area.height;
                area.y = selectionOrigin[1] - area.height;
            }
            if (card === "n" || card === "s") {
                resizeHorizontally = false;
            } else if (card === "e" || card === "w") {
                resizeVertically = false;
            }

            on("move", resizeSelection);
            on("stop", releaseSelection);

            refresh("pickResizeHandler");
        },
        resizeSelection = function (event) {
            cancelEvent(event);
            focus();

            var mousePosition = getMousePosition(event);

            // Get the selection size
            var height = mousePosition[1] - selectionOrigin[1],
                width = mousePosition[0] - selectionOrigin[0];

            // If the selection size is smaller than the minimum size set it to minimum size
            if (Math.abs(width) < options.minSize[0]) {
                width = (width >= 0) ? options.minSize[0] : -options.minSize[0];
            }
            if (Math.abs(height) < options.minSize[1]) {
                height = (height >= 0) ? options.minSize[1] : -options.minSize[1];
            }
            // Test if the selection size exceeds the image bounds
            if (selectionOrigin[0] + width < 0 || selectionOrigin[0] + width > $image.width()) {
                width = -width;
            }
            if (selectionOrigin[1] + height < 0 || selectionOrigin[1] + height > $image.height()) {
                height = -height;
            }
            // Test if the selection size is bigger than the maximum size (ignored if minSize > maxSize)
            if (options.maxSize[0] > options.minSize[0] && options.maxSize[1] > options.minSize[1]) {
                if (Math.abs(width) > options.maxSize[0]) {
                    width = (width >= 0) ? options.maxSize[0] : -options.maxSize[0];
                }

                if (Math.abs(height) > options.maxSize[1]) {
                    height = (height >= 0) ? options.maxSize[1] : -options.maxSize[1];
                }
            }

            // Set the selection size
            if (resizeHorizontally) {
                area.width = width;
            }
            if (resizeVertically) {
                area.height = height;
            }
            // If any aspect ratio is specified
            if (options.aspectRatio) {
                // Calculate the new width and height
                if ((width > 0 && height > 0) || (width < 0 && height < 0)) {
                    if (resizeHorizontally) {
                        height = Math.round(width / options.aspectRatio);
                    } else {
                        width = Math.round(height * options.aspectRatio);
                    }
                } else {
                    if (resizeHorizontally) {
                        height = -Math.round(width / options.aspectRatio);
                    } else {
                        width = -Math.round(height * options.aspectRatio);
                    }
                }
                // Test if the new size exceeds the image bounds
                if (selectionOrigin[0] + width > $image.width()) {
                    width = $image.width() - selectionOrigin[0];
                    height = (height > 0) ? Math.round(width / options.aspectRatio) : -Math.round(width / options.aspectRatio);
                }

                if (selectionOrigin[1] + height < 0) {
                    height = -selectionOrigin[1];
                    width = (width > 0) ? -Math.round(height * options.aspectRatio) : Math.round(height * options.aspectRatio);
                }

                if (selectionOrigin[1] + height > $image.height()) {
                    height = $image.height() - selectionOrigin[1];
                    width = (width > 0) ? Math.round(height * options.aspectRatio) : -Math.round(height * options.aspectRatio);
                }

                // Set the selection size
                area.width = width;
                area.height = height;
            }

            if (area.width < 0) {
                area.width = Math.abs(area.width);
                area.x = selectionOrigin[0] - area.width;
            } else {
                area.x = selectionOrigin[0];
            }
            if (area.height < 0) {
                area.height = Math.abs(area.height);
                area.y = selectionOrigin[1] - area.height;
            } else {
                area.y = selectionOrigin[1];
            }

            fireEvent("changing");
            refresh("resizeSelection");
        },
        moveSelection = function (event) {
            cancelEvent(event);
            if (!options.allowMove) {
                return;
            }
            focus();

            var mousePosition = getMousePosition(event);
            moveTo({
                x: mousePosition[0] - selectionOffset[0],
                y: mousePosition[1] - selectionOffset[1]
            });

            fireEvent("changing");
        },
        moveTo = function (point) {
            // Set the selection position on the x-axis relative to the bounds
            // of the image
            if (point.x > 0) {
                if (point.x + area.width < $image.width()) {
                    area.x = point.x;
                } else {
                    area.x = $image.width() - area.width;
                }
            } else {
                area.x = 0;
            }
            // Set the selection position on the y-axis relative to the bounds
            // of the image
            if (point.y > 0) {
                if (point.y + area.height < $image.height()) {
                    area.y = point.y;
                } else {
                    area.y = $image.height() - area.height;
                }
            } else {
                area.y = 0;
            }
            refresh("moveSelection");
        },
        releaseSelection = function (event) {
            cancelEvent(event);
            off("move", "stop");

            // Update the selection origin
            selectionOrigin[0] = area.x;
            selectionOrigin[1] = area.y;

            // Reset the resize constraints
            resizeHorizontally = true;
            resizeVertically = true;

            fireEvent("changed");

            refresh("releaseSelection");
        },
        deleteSelection = function (event) {
            // cancelEvent(event);
            $selection.remove();
            $outline.remove();
            $.each($resizeHandlers, function (card, $handler) {
                $handler.remove();
            });
            if (options.allowDelete) {
                $btDelete.remove();
            }
            if (options.keyShow) {
                $countg.remove();
            }
            if (options.addPlus) {
                $add_p.remove();
            }
            if (options.numbering) {
                $numb.remove();
            }
            // $divs.remove();
            parent._remove(id);
            fireEvent("changed");
        },
        getElementOffset = function (object) {
            var offset = $(object).offset();

            return [offset.left, offset.top];
        },
        getMousePosition = function (event) {
            var imageOffset = getElementOffset($image);

            if (!event.pageX) {
                if (event.originalEvent) {
                    event = event.originalEvent;
                }

                if (event.changedTouches) {
                    event = event.changedTouches[0];
                }

                if (event.touches) {
                    event = event.touches[0];
                }
            }
            var x = event.pageX - imageOffset[0],
                y = event.pageY - imageOffset[1];

            x = (x < 0) ? 0 : (x > $image.width()) ? $image.width() : x;
            y = (y < 0) ? 0 : (y > $image.height()) ? $image.height() : y;

            return [x, y];
        };


    // Initialize an outline layer and place it above the trigger layer
    $outline = $("<div class=\"select-areas-outline\" id='" + area.id + "' />")
        .css({
            opacity: options.outlineOpacity,
            position: "absolute"
        })
        .insertAfter($trigger);

    $addLine = $("<div id=\"addLineHere" + area.id + "\"/>").insertAfter($trigger)

    // Initialize a selection layer and place it above the outline layer
    clr = (parent.areas().length + 1) == 1 ? '#fb5959' : '#5b59fb'
    $selection = $("<div />")
        .addClass("select-areas-background-area")
        .attr("id", area.id)
        .css({
            background: "#fff url(" + $image.attr("src") + ") no-repeat",
            backgroundSize: $image.width() + "px",
            position: "absolute",
            border: "1px solid " + clr
        })
        .insertAfter($outline);

    // Initialize all handlers
    if (options.allowResize) {
        $.each(["nw", "n", "ne", "e", "se", "s", "sw", "w"], function (key, card) {
            $resizeHandlers[card] = $("<div class=\"select-areas-resize-handler " + card + "\"/>")
                .css({
                    opacity: 0.8,
                    position: "absolute",
                    cursor: card + "-resize"
                })
                .insertAfter($selection)
                .mousedown(pickResizeHandler)
                .bind("touchstart", pickResizeHandler);
        });
    }
    // initialize delete button
    if (options.allowDelete) {
        var bindToDelete = function ($obj) {
            if (options.allowDelete == 'delete') {
                $obj.click(deleteSelection)
                    .bind("touchstart", deleteSelection)
                    .bind("tap", deleteSelection);
            }
            return $obj;
        };
        $btDelete = bindToDelete($("<div class=\"delete-area delete-area-" + area.id + "\" id=\"" + area.id +"\"/ > "))
            .append(bindToDelete($("<div class=\"select-areas-delete-area\" />")))
            .insertAfter($selection);
    }

    if (options.keyShow) {
        $countg = $("<div class=\"select-count" + area.id + "\" ></div>")
            .css({
                position: "absolute"
            })
            .insertAfter($selection)
    }

    if (options.addPlus) {
        var add_p = ''
        add_p += '<div class="add_plus add_plus' + area.id + '">'
        add_p += '<img src="images/plus.svg" class="plus_icon" id="' + area.id + '" title="click here to add">'
        add_p += '<div class="add_select" id="' + area.id + '">' + options.addOptions + '</div>'
        add_p += '</div>'
        $add_p = $(add_p)
            .insertAfter($selection)

    }

    if(options.numbering){
        var numb= ''
        // numb += '<div class="numb_key numb_key'+area.id+'">'+(parent.areas().length+1)+'</div>'
        if((parent.areas().length+1) == 1){
            numb += '<div class="v_class numb_key numb_key'+area.id+'">V</div>'
        }
        else{
            if(area.dropdown_value  == "context"){
              numb += '<div class="c_class numb_key numb_key'+area.id+'">C</div>'
            }
            else{
              numb += '<div class="k_class numb_key numb_key'+area.id+'">K</div>'
            }
            //numb += '<div class="k_class numb_key numb_key'+area.id+'">K</div>'
        }
            

        $numb = $(numb)
        .insertAfter($selection)

    }
    // $divs = $('<div><button class="extraBtnsClick _2d" style="width: 50%;font-size: 10px;">2D</button><button class="extraBtnsClick _4d" style="width: 50%;font-size: 10px;">4D</button></div>').insertAfter($selection)

    if (options.allowMove) {
        $selection.mousedown(pickSelection).bind("touchstart", pickSelection);
    }

    focus();
    obj____ = {
        getData: getData,
        startSelection: startSelection,
        deleteSelection: deleteSelection,
        options: options,
        blur: blur,
        focus: focus,
        nudge: function (point) {
            point.x = area.x;
            point.y = area.y;
            if (point.d) {
                point.y = area.y + point.d;
            }
            if (point.u) {
                point.y = area.y - point.u;
            }
            if (point.l) {
                point.x = area.x - point.l;
            }
            if (point.r) {
                point.x = area.x + point.r;
            }
            moveTo(point);
            fireEvent("changed");
        },
        set: function (dimensions, silent) {
            area = $.extend(area, dimensions);
            selectionOrigin[0] = area.x;
            selectionOrigin[1] = area.y;
            if (!silent) {
                fireEvent("changed");
            }
        },
        contains: function (point) {
            return (point.x >= area.x) && (point.x <= area.x + area.width) &&
                (point.y >= area.y) && (point.y <= area.y + area.height);
        }
    }
    return obj____;
};


$.imageSelectAreas = function () {};

$.imageSelectAreas.prototype.init = function (object, customOptions) {
    var that = this,
        defaultOptions = {
            allowEdit: true,
            allowMove: true,
            allowResize: true,
            allowSelect: true,
            allowDelete: 'delete',
            allowNudge: true,
            aspectRatio: 0,
            minSize: [10, 10],
            maxSize: [0, 0],
            width: 0,
            maxAreas: 0,
            outlineOpacity: 0.5,
            overlayOpacity: 0.2,
            areas: [],
            onChanging: null,
            onChanged: null,
            onReset: null,
            keyShow: false,
            addPlus: false,
            numbering: false,
            addOptions: [],
            addType: ""
        };

    this.options = $.extend(defaultOptions, customOptions);

    if (!this.options.allowEdit) {
        this.options.allowSelect = this.options.allowMove = this.options.allowResize = false;
        this.options.allowDelete = 'delete'
    }

    this._areas = {};

    // Initialize the image layer
    this.$image = $(object);

    this.ratio = 1;
    if (this.options.width && this.$image.width() && this.options.width !== this.$image.width()) {
        this.ratio = this.options.width / this.$image.width();
        this.$image.width(this.options.width);
    }

    if (this.options.onChanging) {
        this.$image.on("changing", this.options.onChanging);
    }
    if (this.options.onChanged) {
        this.$image.on("changed", this.options.onChanged);
    }
    if (this.options.onLoaded) {
        this.$image.on("loaded", this.options.onLoaded);
    }
    if (this.options.onReset) {
        this.$image.on("loaded", this.options.onReset);
    }

    // Initialize an image holder
    this.$holder = $("<div />")
        .css({
            position: "relative",
            width: this.$image.width(),
            height: this.$image.height()
        });

    // Wrap the holder around the image
    this.$image.wrap(this.$holder)
        .css({
            position: "absolute"
        });

    // Initialize an overlay layer and place it above the image
    this.$overlay = $("<div class=\"select-areas-overlay\" />")
        .css({
            opacity: this.options.overlayOpacity,
            position: "absolute",
            width: this.$image.width(),
            height: this.$image.height()
        })
        .insertAfter(this.$image);

    // Initialize a trigger layer and place it above the overlay layer
    this.$trigger = $("<div />")
        .css({
            backgroundColor: "#000000",
            opacity: 0,
            position: "absolute",
            width: this.$image.width(),
            height: this.$image.height()
        })
        .insertAfter(this.$overlay);



    $.each(this.options.areas, function (key, area) {
        that._add(area, true);
    });


    this.blurAll();
    this._refresh();

    if (this.options.allowSelect) {
        // Bind an event handler to the "mousedown" event of the trigger layer
        this.$trigger.mousedown($.proxy(this.newArea, this)).on("touchstart", $.proxy(this.newArea, this));
    }
    if (this.options.allowNudge) {
        // $('html').keydown(function (e) { // move selection with arrow keys
        //     var codes = {
        //             37: "l",
        //             38: "u",
        //             39: "r",
        //             40: "d"
        //         },
        //         direction = codes[e.which],
        //         selectedArea;
        //
        //     if (direction) {
        //         that._eachArea(function (area) {
        //             if (area.getData().z === 100) {
        //                 selectedArea = area;
        //                 return false;
        //             }
        //         });
        //         if (selectedArea) {
        //             var move = {};
        //             move[direction] = 1;
        //             selectedArea.nudge(move);
        //         }
        //     }
        // });
    }
};

$.imageSelectAreas.prototype._refresh = function () {

    var nbAreas = this.areas().length;
    this.$overlay.css({
        display: nbAreas ? "block" : "none"
    });
    if (nbAreas) {
        this.$image.addClass("blurred");
    } else {
        this.$image.removeClass("blurred");
    }
    this.$trigger.css({
        cursor: this.options.allowSelect ? "crosshair" : "default"
    });
};

$.imageSelectAreas.prototype._eachArea = function (cb) {

    $.each(this._areas, function (id, area) {
        if (area) {
            return cb(area, id);
        }
    });
};

$.imageSelectAreas.prototype._remove = function (id) {
    delete this._areas[id];
    this._refresh();
};

$.imageSelectAreas.prototype.remove = function (id) {
    if (this._areas[id]) {
        this._areas[id].deleteSelection();
    }
};

$.imageSelectAreas.prototype.newArea = function (event) {
    var id = -1;
    this.blurAll();
    if (this.options.maxAreas && this.options.maxAreas <= this.areas().length) {
        return id;
    }
    this._eachArea(function (area, index) {
        id = Math.max(id, parseInt(index, 10));
    });
    id += 1;

    this._areas[id] = $.imageArea(this, id);
    if (event) {
        this._areas[id].startSelection(event);
    }
    return id;
};

$.imageSelectAreas.prototype.set = function (id, options, silent) {
    if (this._areas[id]) {
        options.id = id;
        this._areas[id].set(options, silent);
        this._areas[id].focus();
    }
};

$.imageSelectAreas.prototype._add = function (options, silent) {
    var id = this.newArea();
    this.set(id, options, silent);
};

$.imageSelectAreas.prototype.add = function (options) {
    var that = this;
    this.blurAll();
    if ($.isArray(options)) {
        $.each(options, function (key, val) {
            that._add(val);
        });
    } else {
        this._add(options);
    }
    this._refresh();
    if (!this.options.allowSelect && !this.options.allowMove && !this.options.allowResize) {
        this.blurAll();
    }
};

$.imageSelectAreas.prototype.reset = function () {
    var that = this;
    this._eachArea(function (area, id) {
        that.remove(id);
    });
    // this._refresh();
};

$.imageSelectAreas.prototype.destroy = function () {
    this.reset();
    this.$holder.remove();
    this.$overlay.remove();
    this.$trigger.remove();
    this.$image.css("width", "").css("position", "").unwrap();
    this.$image.removeData("mainImageSelectAreas");
};

$.imageSelectAreas.prototype.areas = function () {
    var ret = [];
    this._eachArea(function (area) {
        var ar = area.getData();
        ret.push(ar);
    });
    return ret;
};

$.imageSelectAreas.prototype.relativeAreas = function () {
    var areas = this.areas(),
        ret = [],
        ratio = this.ratio,
        scale = function (val) {
            return Math.floor(val / ratio);
        };

    for (var i = 0; i < areas.length; i++) {
        ret[i] = $.extend({}, areas[i]);
        ret[i].x = scale(ret[i].x);
        ret[i].y = scale(ret[i].y);
        ret[i].width = scale(ret[i].width);
        ret[i].height = scale(ret[i].height);
    }
    return ret;
};

$.imageSelectAreas.prototype.blurAll = function () {
    this._eachArea(function (area) {
        area.blur();
    });
};

$.imageSelectAreas.prototype.contains = function (point) {
    var res = false;
    this._eachArea(function (area) {
        if (area.contains(point)) {
            res = true;
            return false;
        }
    });
    return res;
};

$.selectAreas = function (object, options) {
    var $object = $(object);
    if (!$object.data("mainImageSelectAreas")) {
        var mainImageSelectAreas = new $.imageSelectAreas();
        mainImageSelectAreas.init(object, options);
        $object.data("mainImageSelectAreas", mainImageSelectAreas);
        $object.trigger("loaded");
    }
    return $object.data("mainImageSelectAreas");
};

$.fn.selectAreas = function (customOptions) {
    if ($.imageSelectAreas.prototype[customOptions]) { // Method call
        var ret = $.imageSelectAreas.prototype[customOptions].apply($.selectAreas(this), Array.prototype.slice.call(arguments, 1));
        return typeof ret === "undefined" ? this : ret;

    } else if (typeof customOptions === "object" || !customOptions) { // Initialization
        //Iterate over each object
        this.each(function () {
            var currentObject = this,
                image = new Image();

            // And attach selectAreas when the object is loaded
            image.onload = function () {
                $.selectAreas(currentObject, customOptions);
            };

            // Reset the src because cached images don"t fire load sometimes
            image.src = currentObject.src;

        });
        return this;

    } else {
        $.error("Method " + customOptions + " does not exist on jQuery.selectAreas");
    }
};
// }) (jQuery);
