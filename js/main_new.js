$(document).ready(function () {
    $(".zoombts").removeClass('active')
    originUrl = window.location.origin.split(':');
    $('.selectClass').show();
    // dynamicUrl = originUrl[0] + ":" + originUrl[1] + ":5002";
    dynamicUrl = 'http://35.173.139.208:5002';
    fieldSplits = 0;
    var extracropcount = 0;
    $(".secondary_view").hide();
    $(".autoSuggestView").hide();

    document_identifiers = []

    var selectedBox = '';

    var d_i_opts = ''
    var trainedTable = []
    var zoom = 100;
    var zoomTo = 5;
    var maxZoom = 250;
    var minZoom = 100;
    var clickedAdd = false;

    var extraTrainingFields = {}
    var allDisplayFields = []

    var trained_table = {}
    var nextClicked = false;

    var forcedTemplateName;
    var footerData;

    var tableCount = 0;

    var default_Output_fields = []

    var mandatoryFields = [];
    var new_predicted_data = {}
    var fieldSelectPlug = {}
    var headerCropAreas = {},
        vendor_crop_data = {},
        tableCrops = {};
    var tableFinalCrops = {};
    var all_cropped_data_history = {};

    var groupCurrencyOpts = [];

    var mainAreasCount = [];
    var already_selected = {};
    var showFieldTrain = false
    var initial_training_arr = ["header_ocr", "address_ocr", "footer_ocr"];

    var last_selected = 'header';
    var alt_title = 'header';

    var mainDataToSend = {};
    var final_table_save = {}
    var img_ocr_data;
    var final_arr = {}
    var imagefiles_;
    var fieldHistory = {}
    var forFields = []
    var forTable = []
    var list_json = []
    var clicked_id;
    var retrainedData = {}

    var retrainedTable = {};

    var vendor_list = []

    var default_op_optns = [];
    var validation_select = [];
    var field_id = 0;
    var field_target = '';
    var class_name_field = ''

    var tab_field_def = {}

    var click_crop_area;
    var file_id = getUrlParameter('file_name');
    var case_id = getUrlParameter('case_id');
    var retrain = getUrlParameter('retrain');
    var user_name = getUrlParameter('user');
    var template_name_retrain = getUrlParameter('template');
    var tenant_id = getUrlParameter('host_name')

    var field_crop_flag;
    retrain = nullCheck(retrain) ? retrain : "no"

    var predicted_data = [];
    var table_data_final = {}

    var alias_data

    if (template_name_retrain == 'new') {
        retrain = 'no';
    }

    var areaCount = 1;
    det_delete = true;
    field_areas_obj = {};

    var dropDown_add

    if (retrain == "yes") {
        $("#edit_new_temp").show();
    } else {
        $("#edit_new_temp").hide();
    }
    case_id = case_id.split('.')[0];

    var stepper = document.querySelector('.stepper');
    var stepperInstace = new MStepper(stepper, {
        // options
        firstActive: 0, // this is the default
        // Allow navigation by clicking on the next and previous steps on linear steppers.
        linearStepsNavigation: false,
        // Enable or disable navigation by clicking on step-titles
        stepTitleNavigation: false,
        // Preloader used when step is waiting for feedback function. If not defined, Materializecss spinner-blue-only will be used.
        feedbackPreloader: '<div class="spinner-layer spinner-blue-only">...</div>'
    })

    // var file_name___
    if (nullCheck(case_id)) {
        sendObj = {};
        sendObj.file_name = file_id;
        sendObj.case_id = case_id;
        sendObj.retrain = retrain;
        sendObj.tenant_id = tenant_id
        if (retrain == 'yes') {
            sendObj.template_name = template_name_retrain.replace(/%20/g, " ");
            $(".secondary_view").show();
            $(".initial_view").hide()
        }


        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/get_ocr_data_training",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(sendObj)
        };
        $(".loading_full").show();
        // msg = testSample
        $.ajax(settings11).done(function (msg) {
            if (msg.flag) {
                $(".loading_full p").html('Loading Image...')
                file_id = msg.file_name;

                tab_field_def = msg.properties;
                groupCurrencyOpts = msg.dropdown_dict;
                // tab_field_def = testSample.tab_fields_def
                // groupCurrencyOpts = testSample.tab_dropdown;
                file_name = 'images/invoices/' + file_id;
                document_identifiers = msg.document_identifiers;

                mandatoryFields = msg.mandatory_fields;
                idx = mandatoryFields.indexOf('Vendor Name');
                mandatoryFields.splice(idx, 1)
                idx = mandatoryFields.indexOf('Digital Signature');
                mandatoryFields.splice(idx, 1)

                dropDown_add = msg.drop_down_config

                // default_Output_fields = msg.fields

                if (nullCheck(msg.info)) {
                    retrainedData = msg.info.fields;
                    retrainedTable = msg.info.table;
                }
                template_name_list = msg.template_list;


                if (nullCheck(template_name_list)) {
                    vr = '<option value="">Select Template</option>'
                    for (t = 0; t < template_name_list.length; t++) {
                        vr += '<option value="' + template_name_list[t] + '">' + template_name_list[t] + '</option>'
                    }
                    $(".forceTemp").html(vr);
                    $(".forceTemp").formSelect();
                }
                // $(".secondary_view").hide();
                //  }
                // else {
                //     template_name_retrain = msg.template_name;
                //     $(".secondary_view").show();
                //     $(".initial_view").hide()
                // }
                vendor_list = msg.vendor_list;
                // vendor_list = ["Sample", "Sample 1", "Sample 2"];

                vendr_optns = ''
                for (var i = 0; i < vendor_list.length; i++) {
                    vendr_optns += '<option value="' + vendor_list[i] + '">'
                }
                $("#templates_list").html(vendr_optns)
                // if (nullCheck(msg.fields)) {
                //     default_Output_fields = msg.fields;
                // }
                img_ocr_data = msg.data;

                new_predicted_data = msg.grouped_mandatory_fields;

                predicted_data = msg.predicted_fields;

                default_Output_fields = msg.fields;

                forFields = []
                forTable = []
                for (var i = 0; i < default_Output_fields.length; i++) {
                    if (default_Output_fields[i].indexOf('Table.') == -1) {
                        forFields.push(default_Output_fields[i])
                    } else {
                        forTable.push(default_Output_fields[i].replace('Table.', ''))
                    }
                }

                fieldHistory = {}

                allDisplayFields = []

                forFields = [];

                img_width = $(".HorZOn").width();

                for (var i = 0; i < predicted_data.length; i++) {
                    forFields.push(predicted_data[i]['field'])
                    ky_ = predicted_data[i]['field'].replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_');
                    for (var j = 0; j < predicted_data[i]['coordinates'].length; j++) {
                        page = predicted_data[i]['coordinates'][j].page;

                        if (!nullCheck(fieldHistory[i + "-" + ky_])) {
                            fieldHistory[i + "-" + ky_] = []
                        }

                        crop_cod = predicted_data[i]['coordinates'][j];
                        width_ = $(".HorZOn").width();
                        obj = {}
                        obj = crop_cod
                        wd = resizeFactor(crop_cod.width, width_);
                        ht = resizeFactor(crop_cod.height, width_);
                        lf = resizeFactor(crop_cod.x, width_);
                        tp = resizeFactor(crop_cod.y, width_);

                        obj.width = wd > 9 ? (img_width > wd ? wd : 200) : 10;
                        obj.height = ht > 9 ? ht : 10;

                        obj.x = lf > 0 ? (lf > img_width ? 10 : lf) : 1;
                        obj.y = tp > 0 ? (tp > 2000 ? 10 : tp) : 20;
                        obj.type = j == 0 ? 'value' : 'keyword'
                        fieldHistory[i + "-" + ky_].push(obj)
                    }

                    try {
                        for (let i_ = 0; i_ < fieldHistory[i + "-" + ky_].length; i_++) {
                            if (fieldHistory[i + "-" + ky_][i_].child && fieldHistory[i + "-" + ky_][i_].child.length > 0) {
                                for (let i_j = 0; i_j < fieldHistory[i + "-" + ky_][i_].child.length; i_j++) {
                                    fieldHistory[i + "-" + ky_][fieldHistory[i + "-" + ky_][i_].child[i_j]].parent = i_;
                                }
                            }
                        }
                    } catch (e) {
                        fieldHistory[i + "-" + ky_] = []
                    }
                    field_areas_obj = fieldHistory

                }

                d_i_opts = '<option value="">Select Field</option>'
                for (let d_i_i = 0; d_i_i < forFields.length; d_i_i++) {
                    d_i_opts += '<option value="' + forFields[d_i_i] + '">' + forFields[d_i_i] + '</option>'
                }
                for (let d_ii = 0; d_ii < document_identifiers.length; d_ii++) {
                    $(".all_dis").append('<select class="di_select di_select' + d_ii + '">' + d_i_opts + '</select>');
                    $('.di_select' + d_ii + ' option[value="' + document_identifiers[d_ii] + '"]').attr('selected', 'selected');
                }


                if (msg.type == 'blob') {
                    obj = {}
                    obj.case_id = case_id;
                    obj.tenant_id = tenant_id

                    var settings11 = {
                        "async": true,
                        "crossDomain": true,
                        "url": dynamicUrl + "/get_blob_data",
                        "method": "POST",
                        "processData": false,
                        "contentType": "application/json",
                        "data": JSON.stringify(obj)
                    };
                    $(".loading_full").show();
                    $.ajax(settings11).done(function (bl) {
                        if (bl.flag) {
                            blob_data = bl.data;
                            pdftoimg(blob_data)
                        } else if ($.type(bl) == 'string') {
                            $.alert('Something went wrong', 'Alert');
                            $(".loading_full").hide();
                        } else {
                            $(".loading_full").hide();
                            $.alert(bl.message, 'Alert');
                        }
                    })
                } else {
                    // localStorage.setItem('ocr', JSON.stringify(img_ocr_data))
                    check_file = file_name.substr(file_name.length - 5)
                    logThis(6, [file_name, check_file]);
                    if (check_file.toLowerCase().indexOf('.pdf') > -1) {
                        logThis(8, "Its a PDF file")
                        previewPdfFile(file_name)
                    } else if (check_file.toLowerCase().indexOf('.tiff') > -1 || check_file.toLowerCase().indexOf('.tif') > -1) {
                        logThis(8, "Its a TIFF file")
                        previewTiffFile(file_name)
                    } else if (check_file.toLowerCase().indexOf('.jpg') > -1 || check_file.toLowerCase().indexOf('.jpeg') > -1 || check_file.toLowerCase().indexOf('.png') > -1) {
                        logThis(8, "Its a Image file")
                        displayImage([file_name])
                    } else {
                        logThis(8, "It is not a image file")
                    }
                }

            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
                $(".loading_full").hide();
            } else {
                $(".loading_full").hide();
                $.alert(msg.message, 'Alert');
            }
        })
    }

    $("body").on("click", ".create_new_temp", function () {
        for (var i = 0; i < imagefiles_.length; i++) {
            width_ = $(".imagesCountNum" + i).width();
            $("#imageCountNum" + i).selectAreas({
                onChanged: debugKeywordAreas,
                onChanging: changingAllAreas,
                width: width_,
                allowDelete: 'delete',
                addPlus: false,
                numbering: false,
            });
        }
        forcedTemplateName = ''
        $(".secondary_view").show();
        $(".initial_view").hide()
    })

    $("body").on("change", ".mv_to_verify", function () {
        val = $(this).val();
        obj = {}
        obj.case_id = case_id;
        obj.invoice_type = val;
        obj.queue = 'template'
        obj.tenant_id = tenant_id
        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/move_to_verify",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(obj)
        };
        $(".loading_full").show();
        $.ajax(settings11).done(function (msg) {
            $(".loading_full").hide();
            if (msg.flag) {
                alert(msg.message);
                setTimeout(function () {
                    closePage()
                }, 1000);
            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
                $(".loading_full").hide();
            } else {
                $(".loading_full").hide();
                $.alert(msg.message, 'Alert');
            }
        });

    })

    $("body").on("click", ".edit_new_temp", function () {
        //forcedTemplateName = ''
        $(".secondary_view").show();
        $(".initial_view").hide()
    })

    function displayImage(imagefiles) {
        // if (nullCheck(imagefiles)) {
        //     $(".loading_full_pdf").hide();
        // }
        inital_ct = 0;
        img__ = ''
        //here need to get all data like OCR from database
        imagefiles_ = imagefiles;
        for (var i = 0; i < imagefiles.length; i++) {
            img__ += '<img src="' + imagefiles[i] + '" id="imageCountNum' + i + '" class="imageCount imageCountNum' + i + '" alt="' + i + '"  width="100%">';
        }
        $(".HorZOn").html(img__)
        if (retrain == 'yes') {
            for (var i = 0; i < imagefiles.length; i++) {
                width_ = $(".imagesCountNum" + i).width();
                $("#imageCountNum" + i).selectAreas({
                    onChanged: debugHeaderAreas,
                    width: width_,
                    maxAreas: 3
                });
            }
        }
        $(".loading_full p").html('Loading...')
        $(".loading_full").hide();

    }

    var tableCrops
    // $('.nextToFields').prop('disabled', 'true');
    var uniqueFieldsList = []
    var all_keywords_data = [];


    debugKeywordAreas = function debugKeywordAreas(event, id, areas) {
        if (!nullCheck(nextClicked)) {
            $(".keywords_display").html('')
            generateKeywords()
        }
    }

    function generateKeywords() {
        width_ = $("#imageCountNum0").width()
        noFiles = $(".imageCount").length;
        all_keywords_data = []
        for (let j = 0; j < noFiles; j++) {
            areas_ = $('#imageCountNum' + j).selectAreas('areas');

            for (let i = 0; i < areas_.length; i++) {
                areas_[i].page = j
                words_data = rte(areas_[i], width_);
                displayKeyWords(words_data, areas_[i])
            }
        }
    }

    function displayKeyWords(words, ar) {
        text = ''
        for (let j = 0; j < words.length; j++) {
            text += ' ' + words[j].word;
        }
        var temp_obj = Object.assign({}, ar)
        temp_obj.word = $.trim(text)
        all_keywords_data.push(temp_obj)
        $(".keywords_display").append('<input type="text" value="' + $.trim(text) + '">');
    }

    $("body").on("click", ".saveKeywords", function () {
        nextClicked = true
        nofiles = $(".imageCount").length;


        // //(all_cropped_data_history);

        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }


        displayFieldsMain()
        //(mainDataToSend);


        $("select").formSelect();

        stepperInstace.nextStep()

        // nextToFields();
    })

    function nextToUnique() {

        nextClicked = true;
        nofiles = $(".imageCount").length
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
        stepperInstace.nextStep()

        for (var i = 0; i < imagefiles_.length; i++) {
            width_ = $(".imagesCountNum" + i).width();
            $("#imageCountNum" + i).selectAreas({
                onChanged: debugHeaderAreas,
                width: width_,
                allowDelete: 'delete',
                addPlus: false,
                numbering: false,
            });
        }
        forcedTemplateName = ''


    }

    debugHeaderAreas = function debugHeaderAreas(event, id, areas) {
        target = event.target.alt;
        nofiles = $(".imageCount").length;
        a = 0;
        click_crop_area = areas;
        if (!nullCheck(nextClicked)) {
            if (alt_title == 'header') {
                area_indx = areas.findIndex(x => x.id == id);
                if (area_indx > -1) {
                    areas[area_indx].page = target;
                }
                displayUniqFields()
            } else if (alt_title == 'table') {
                if (nullCheck(areas[id])) {
                    areas[id].page = target;
                    tableCrops[target] = areas
                    tableFinalCrops[target] = Object.assign({}, areas);
                }
                //(tableCrops);
                for (var i = 0; i < nofiles; i++) {
                    if (nullCheck(tableCrops[i])) {
                        a = a + tableCrops[i].length;
                    }
                }
                table_train = false
                $(".tryTable").remove();
                tbl = '<button class="waves-effect waves-light btn-small mr-t-10 tryTable"  onclick="return false;">Proceed</button>'

                $(".intialTableConfirm").html(tbl)
            }
        }
    }

    debugDeleteAreas = function debugDeleteAreas(event, id, areas) {}
    debugFieldAreas = function debugFieldAreas(event, id, areas) {
        target = event.target.alt;
        box_id = clicked_id + "-" + selectedBox;
        nofiles = $(".imageCount").length;
        a = 0;
        click_crop_area = areas;
        if (!nullCheck(nextClicked)) {
            removeOtherPageCrops(target, box_id)
            if (alt_title == 'field') {
                ar_ind = areas.findIndex(x => x.id == id);
                if (ar_ind > -1) {
                    areas[ar_ind].page = target;
                    // areas[ar_ind].record = 'new';
                    fieldHistory[box_id] = areas;

                    if (areas.length == 1) {
                        if (areas[0].type == 'keyword') {
                            $(".value-final-" + box_id).val('');
                        } else {
                            $(".keyword-final-" + box_id).val('');
                        }
                    }

                    croped = areas[ar_ind];
                    reslt = rte(croped, $("#imageCountNum0").width());

                    get_Ocr(reslt, box_id, areas[ar_ind].type)
                } else {
                    fieldHistory[box_id] = areas;
                    if (areas.length == 0) {
                        $(".value-final-" + box_id).val('');
                        $(".keyword-final-" + box_id).val('');
                    } else if (areas.length == 1) {
                        if (areas[0].type == 'keyword') {
                            $(".value-final-" + box_id).val('');
                        } else {
                            $(".keyword-final-" + box_id).val('');
                        }
                    }
                }

            }
        }
    }

    function removeOtherPageCrops(target, box_id) {
        nofiles = $(".imageCount").length;
        nextClicked = true
        for (var i = 0; i < nofiles; i++) {
            if (i != target) {
                $('#imageCountNum' + i).selectAreas('reset');
            }
        }
        fieldHistory[box_id] = [];
        // $(".value-final-"+box_id).val('');
        // $(".keyword-final-"+box_id).val('');
        nextClicked = false
    }


    function displayUniqFields() {
        rt = ''
        text_ = ''
        nofiles = $(".imageCount").length;
        for (var i = 0; i < nofiles; i++) {
            cropss = $('#imageCountNum' + i).selectAreas('areas');
            for (var cp = 0; cp < cropss.length; cp++) {
                rteData = rte(cropss[cp], $("#imageCountNum0").width());

                text = '';
                for (var i = 0; i < rteData.length; i++) {
                    text = text + ' ' + rteData[i].word;
                }
                text_ = $.trim(text);
                rt += '<p class="uniqueFieldInput" tex="' + text_ + '">' + text_ + '</p>'
            }
        }
        if (nullCheck($.trim(text_))) {
            $(".vendorValidation").html(rt)
        } else {
            toast("Empty crop", 'error');
        }
    }

    $("body").on("click", ".addUniqFields", function () {
        nextClicked = true
        nofiles = $(".imageCount").length;
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
        $(".conditionsHere").html('<button class="condThis active" name="and" onclick="return false;">AND</button><button class="condThis" name="or" onclick="return false;">OR</button>')
        clickedAdd = true;
        nextClicked = false;
        width_ = $(".imagesCountNum" + i).width();
        for (var i = 0; i < nofiles; i++) {
            $("#imageCountNum" + i).selectAreas({
                onChanged: debugHeaderAreas,
                width: width_,
                allowDelete: 'delete',
                addPlus: false,
                numbering: false,
            });
        }
    })

    $("body").on("click", ".condThis", function () {
        $(".condThis").removeClass('active')
        $(this).addClass('active')
    })

    $("body").on("change", ".forceTemp", function () {
        val = $(this).val();
        if (nullCheck(val)) {
            forcedTemplateName = val;
            obj = {}
            obj.case_id = case_id;
            obj.force_check = 'yes';
            obj.template_name = forcedTemplateName;
            obj.tenant_id = tenant_id
            var settings11 = {
                "async": true,
                "crossDomain": true,
                "url": dynamicUrl + "/testFields",
                "method": "POST",
                "processData": false,
                "contentType": "application/json",
                "data": JSON.stringify(obj)
            };
            $(".loading_full").show();
            $.ajax(settings11).done(function (msg) {
                //(msg)
                $(".loading_full").hide();
                $(".fieldsDisplayTest").html('')
                if (msg.flag) {
                    $(".testView").show();
                    $(".fieldsDisplayTest").html('<div class="size_template"><select class="forceTemp"></select></div>')

                    if (nullCheck(template_name_list)) {
                        vr = '<option value="">Select Template</option>'
                        for (t = 0; t < template_name_list.length; t++) {
                            vr += '<option value="' + template_name_list[t] + '">' + template_name_list[t] + '</option>'
                        }

                        $(".forceTemp").html(vr);
                        $('.forceTemp option[value="' + val + '"]').attr('selected', 'selected');
                        $(".forceTemp").formSelect();
                    }
                    tst = ''
                    var cnt = 1;
                    $.each(msg.data, function (k, v) {
                        if (!nullCheck(v)) {
                            v = ""
                        }
                        tst = '<div class="col-sm-6">'
                        tst += '<div class="formFieldView hovering">'
                        tst += '<label>' + cnt + ")  " + k + '</label>'
                        tst += '<input type="text" value="' + v + '">'
                        tst += '</div>'
                        tst += '</div>'
                        $(".fieldsDisplayTest").append(tst)
                        cnt = cnt + 1;

                    })
                    $(".confirmForce").removeClass('nextToTable')
                    $(".confirmForce").addClass('forceThisTemp')
                    $(".fieldsDisplayTest").append("<div class='clear__'></div>");
                    hovering2(highlight_list);
                } else if ($.type(msg) == 'string') {
                    $.alert('Something went wrong', 'Alert');
                    $(".loading_full").hide();
                } else {
                    $(".loading_full").hide();
                    $.alert(msg.message, 'Alert');
                }
            });
        }
    })
    // hovering(highlight_list);

    $("body").on("click", ".forceThisTemp", function () {
        obj = {};
        obj.case_id = case_id;
        obj.template_name = forcedTemplateName;
        if (retrain == "yes") {
            obj.retrain = "yes"
        } else {
            obj.retrain = "no"
        }
        obj.tenant_id = tenant_id
        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/force_template",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(obj)
        };
        $(".loading_full").show();
        $.ajax(settings11).done(function (msg) {
            //(msg)
            $(".loading_full").hide();
            if (msg.flag) {
                $(".testView").hide()
                $(".fieldsDisplayTest").html('')
                $.alert(msg.message, 'Alert');
                closePage()
            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
                $(".loading_full").hide();
            } else {
                $(".loading_full").hide();
                $.alert(msg.message, 'Alert');
            }
        });
    })

    $("body").on("change", ".validationLabel", function () {
        key = $(this).attr('key');
        target = $(this).attr('target');
        value = $(this).val();
        keyword = $(".keyword-" + key + "-" + target).val();
        if (value == 'New') {
            $(".NewRuleName").val(keyword)
            $(".submitValidationModal").attr("key", key);
            $(".submitValidationModal").attr("target", target);
            $('#myModal1').modal('show');
        } else {
            vld_ = JSON.parse(sessionStorage.getItem('validation-' + key + '-' + target));
            vld_.pattern = value;
            sessionStorage.setItem('validation-' + key + '-' + target, JSON.stringify(vld_));
        }
    })

    $("body").on("click", ".nextToFields", function () {
        u_fids = $(".uniqueFieldInput");
        u = []
        for (var i = 0; i < u_fids.length; i++) {
            u.push(u_fids[i].attributes.tex.value);
        }
        vendor_crop_data.uniqueFields = {};
        vendor_crop_data.uniqueFields.fields = u.join(', ')
        vendor_crop_data.uniqueFields.condition = $(".condThis.active").attr('name');
        mainDataToSend.template = Object.assign({}, vendor_crop_data);
        if (retrain == "yes" || nullCheck(mainDataToSend.template.uniqueFields)) {
            if (retrain == "yes") {
                nofiles = $(".imageCount").length;
                nextClicked = true
                for (var i = 0; i < nofiles; i++) {
                    $('#imageCountNum' + i).selectAreas('destroy');
                }
                showRetrinedData(retrainedData)
                stepperInstace.nextStep()
            } else {


                // var list_json_ = '<option value="">Select Category</option>';
                // for (i = 0; i < list_json.length; i++) {
                //     //(list_json[i]);
                //     list_json_ += '<option value="' + list_json[i] + '">' + list_json[i] + '</option>';
                // }
                // $(".allFieldResults").prepend('<div class="col-sm-12"><p class="indication_font mr-b-10" id="inv_category_indicator">Select Invoice Category</p><div class="outputBody_ headerBox"><div class="row" style="margin:0px !important"><div class="col-sm-6"><input class="mods_inputs invoiceCat" value="Invoice Category" readonly=""></div><div class="col-sm-6" style="padding: 0px;"><select class="mods_inputs optionss" name="selectClass">' + list_json_ + '</select></div></div></div></div>')

                nextClicked = true
                nofiles = $(".imageCount").length;


                // //(all_cropped_data_history);

                for (var i = 0; i < nofiles; i++) {
                    $('#imageCountNum' + i).selectAreas('destroy');
                }


                displayFieldsMain()
                //(mainDataToSend);


                $("select").formSelect();
                $(".zoombts").addClass('active')

                stepperInstace.nextStep()
            }
        } else {
            $.alert('Crop unique fields to proceed', 'Alert');
        }
    })

    tableTrainedArr = []

    $("body").on("click", ".fieldSaveBtn", function () {
        mainArr = [];
        totalboxess = $(".fieldTrain").length;

        document_identifiers = []
        all_d_i_vals = $(".di_select");

        for (let i = 0; i < all_d_i_vals.length; i++) {
            document_identifiers.push(all_d_i_vals[i].value);
        }
        mainDataToSend.document_identifiers = document_identifiers;

        // unitSelect = $(".unitSelect").length;

        outputTabFields = {}

        notFoundUnits = []
        empt___ = 0

        for (const key in tab_field_def) {
            if (tab_field_def[key].length > 0) {
                for (let i = 0; i < tab_field_def[key].length; i++) {
                    cls = tab_field_def[key][i].unique_name.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
                    outputTabFields[tab_field_def[key][i].unique_name] = $(".unitSelect-" + cls).val();
                    field_name_alert = $(".unitSelect-" + cls).attr('field')
                    if (tab_field_def[key][i].mandatory && !nullCheck($(".unitSelect-" + cls).val())) {
                        notFoundUnits.push(field_name_alert + ' - ' + tab_field_def[key][i].display_name);
                        empt___ = 2;
                    }
                }
            }
        }

        mainDataToSend.units = outputTabFields
        console.log(mainDataToSend);
        for (var ii = 0; ii < totalboxess; ii++) {
            id = $(".fieldTrain")[ii].attributes['id'].value;
            target = $(".fieldTrain")[ii].attributes['target'].value;
            box_id = id + "-" + target;
            width_ = $('#imageCountNum0').width();

            mainObj = {};
            mainObj.field = $(".keyword-" + box_id).attr('field');
            mainObj.value = $(".value-final-" + box_id).val();
            mainObj.coordinates = field_areas_obj[box_id] || [];
            mainObj.width = width_;
            mainObj.page = field_areas_obj[box_id].length > 0 ? field_areas_obj[box_id][0].page : -1;
            mainArr.push(mainObj);
        }
        mainDataToSend.fields = Object.assign({}, mainArr);

        $(".forSave").click();
    })

    $("body").on("click", ".testBtn", function () {
        mainArr = [];
        totalboxess = $(".fieldTrain").length;

        document_identifiers = []
        all_d_i_vals = $(".di_select");

        for (let i = 0; i < all_d_i_vals.length; i++) {
            document_identifiers.push(all_d_i_vals[i].value);
        }
        mainDataToSend.document_identifiers = document_identifiers;

        // unitSelect = $(".unitSelect").length;

        outputTabFields = {}

        notFoundUnits = []
        empt___ = 0

        for (const key in tab_field_def) {
            if (tab_field_def[key].length > 0) {
                for (let i = 0; i < tab_field_def[key].length; i++) {
                    cls = tab_field_def[key][i].unique_name.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
                    outputTabFields[tab_field_def[key][i].unique_name] = $(".unitSelect-" + cls).val();
                    field_name_alert = $(".unitSelect-" + cls).attr('field')
                    if (tab_field_def[key][i].mandatory && !nullCheck($(".unitSelect-" + cls).val())) {
                        notFoundUnits.push(field_name_alert + ' - ' + tab_field_def[key][i].display_name);
                        empt___ = 2;
                    }
                }
            }
        }

        mainDataToSend.units = outputTabFields
        console.log(mainDataToSend);
        for (var ii = 0; ii < totalboxess; ii++) {
            id = $(".fieldTrain")[ii].attributes['id'].value;
            target = $(".fieldTrain")[ii].attributes['target'].value;
            box_id = id + "-" + target;
            width_ = $('#imageCountNum0').width();

            mainObj = {};
            mainObj.field = $(".keyword-" + box_id).attr('field');
            mainObj.value = $(".value-final-" + box_id).val();
            mainObj.coordinates = field_areas_obj[box_id] || [];
            mainObj.width = width_;
            mainObj.page = field_areas_obj[box_id].length > 0 ? field_areas_obj[box_id][0].page : -1;
            mainArr.push(mainObj);
        }
        var vendor_field_data = {
            'field': 'Invoice Category',
            'keyword': $(".optionss").val(),
            'value': $(".optionss").val(),
            'coordinates': [{
                    'x': 0,
                    'y': 0,
                    'width': 0,
                    'height': 0,
                    'page': 0,
                },
                {
                    'x': 0,
                    'y': 0,
                    'width': 0,
                    'height': 0,
                    'page': 0,
                }
            ],
            'page': 0,
            'validation': {}

        }

        if (empt___ == 0) {
            if (nullCheck("value") || retrain == 'yes') {
                mand_check = 0
                notFoundFields = []
                // mandatoryFields = []
                for (var n = 0; n < mandatoryFields.length; n++) {
                    idx__ = mainArr.find(o => o.field === mandatoryFields[n]);
                    if (idx__ == -1 || (idx__ > -1 && nullCheck(mainArr[idx].value))) {
                        notFoundFields.push(mandatoryFields[n]);
                        mand_check = 1;
                    }
                }
                for (i = 0; i < notFoundFields.length; i++) {
                    var temp_obj = {}
                    temp_obj['field'] = notFoundFields[i]
                    temp_obj['value'] = ''
                    temp_obj['page'] = -1
                    temp_obj['not_in_invoice'] = true;
                    temp_obj['value'] = ""
                    temp_obj['coordinates'] = []
                    temp_obj['width'] = width_
                    mainArr.push(temp_obj)
                }
                mainDataToSend.fields = Object.assign({}, mainArr);

                if (mand_check == 1) {
                    $.confirm({
                        title: 'Alert',
                        content: "Please crop " + notFoundFields.join(', ').replace(/_/g, ' ') + " fields",
                        buttons: {
                            skip: function () {
                                testView($('#imageCountNum0').width(), mainDataToSend.fields)
                            },
                            cancel: function () {}
                        }
                    })
                } else {
                    testView($('#imageCountNum0').width(), mainDataToSend.fields)
                }
            } else {}

        } else if (empt___ == 2) {
            notFoundUnits = $.unique(notFoundUnits);
            $.alert("Please select " + notFoundUnits.join(', '), 'Alert');
        }
    })



    $("body").on("click", ".closeTest", function () {
        $('.forceTemp option[value=""]').attr('selected', 'selected');
        $(".testView").hide();
        $(".fieldsDisplayTest").html('');
        $(".selectCropShow2").remove();
        $(".selectCropShow").remove();
    })

    $("body").on("click", ".closeTempModal", function () {
        $(".template_name_val").val('');
        $(".template_name_modal").hide();
    })

    $("body").on("click", ".closeSkipbtn", function () {
        $(".skipCheckModal").hide();
    })

    $("body").on('click', '.confirmAutoSuggest', function () {

    })

    $("body").on("click", ".nextToTable", function () {
        stepperInstace.nextStep()
        $(".zoombts").removeClass('active')

        nextClicked = true;
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
        $(".testView").hide();

        $(".addNewTable").click();

        if (retrain == 'yes' && !$.isEmptyObject(retrainedTable)) {
            displayTableTrainedData(retrainedTable)
        }

        //(mainDataToSend);

        modifiedMainDataToSend = mainDataToSend


        newTable();
    })

    $("body").on("click", ".addNewTable", function () {
        tableCount = $(this).attr("count");
        $(this).attr("count", Number(tableCount) + 1);

        if (!$.isEmptyObject(final_table_save)) {
            $(".header_crop").remove();
            tableTrainedArr.push(final_table_save)
        }
        nextClicked = false
        alt_title = 'table';
        table_train = true
        nofiles = $(".imageCount").length
        for (var i = 0; i < nofiles; i++) {
            width_ = $(".imagesCountNum" + i).width();
            $("#imageCountNum" + i).selectAreas({
                onChanged: debugHeaderAreas,
                width: width_,
                maxAreas: 1
            });
        }
    })

    function newTable() {
        //('new table running')
        tableCount = $(this).attr("count");
        $(this).attr("count", Number(tableCount) + 1);

        if (!$.isEmptyObject(final_table_save)) {
            $(".header_crop").remove();
            tableTrainedArr.push(final_table_save)
        }
        nextClicked = false
        alt_title = 'table';
        table_train = true
        for (var i = 0; i < nofiles; i++) {
            width_ = $(".imagesCountNum" + i).width();
            $("#imageCountNum" + i).selectAreas({
                onChanged: debugHeaderAreas,
                width: width_,
                maxAreas: 2
            });

        }
    }

    // dynamicUrl = "http://3b552222.ngrok.io"
    // tableResponse = [[[[[['<b>SR. NO.</b>', 1, 1], ['<b>PRODUCT DESCRIPTION</b>', 1, 1], ['<b>ITEM CODE</b>', 1, 1], ['<b>HSN CODE</b>', 1, 1], ['<b>BATCH NUMBER</b>', 1, 1], ['<b>EXPIRY DATE</b>', 1, 1], ['<b>TOTAL QUANTITY</b>', 1, 1], ['<b>PKG/ DRUM</b>', 1, 1], ['<b>UOM</b>', 1, 1], ['<b>MRP</b>', 1, 1], ['<b>UNIT PRICE</b>', 1, 1], ['<b>TAXABLE VALUE</b>', 1, 1], ['<b>FREIGHT</b>', 1, 1], ['<b>TOTAL TAXABLE VALUE</b>', 1, 1], ['<b>IGST RATE AMOUNT</b>', 1, 1], ['<b>CGST RATE AMOUNT</b>', 1, 1], ['<b>SGST RATE AMOUNT</b>', 1, 1]], [['', 1, 1], [' 1 ATARAX 6MG/ML 15ML DRO IN', 1, 1], [' FDA00001', 1, 1], [' 30049099', 1, 1], [' LI0418015', 1, 1], [' suspicious11/2020', 1, 1], [' 96240.00', 1, 1], [' 401', 1, 1], [' EA', 1, 1], [' 48.00', 1, 1], [' 8.02', 1, 1], [' 771845.00', 1, 1], ['', 1, 1], [' 771845.00', 1, 1], [' 12.00 92621.00', 1, 1], ['', 1, 1], ['', 1, 1]]], [[[' Total', 1, 1], [' 96240.00 771845.00 771845.00 92621.00', 1, 1]]]],["SR. NO.","PRODUCT DESCRIPTION","ITEM CODE","HSN CODE","BATCH NUMBER","EXPIRY DATE","TOTAL QUANTITY","PKG/ DRUM","UOM","MRP","UNIT PRICE","TAXABLE VALUE","FREIGHT","TOTAL TAXABLE VALUE","IGST RATE AMOUNT","CGST RATE AMOUNT","SGST RATE AMOUNT"], {'hors': [[[13, 195], [655, 195]], [[13, 212], [655, 212]], [[13, 232], [655, 232]]], 'vers': [[[13, 195], [13, 232]], [[16, 195], [16, 232]], [[135, 195], [135, 232]], [[166, 195], [166, 232]], [[193, 195], [193, 232]], [[230, 195], [230, 232]], [[256, 195], [256, 232]], [[289, 195], [289, 232]], [[311, 195], [311, 232]], [[331, 195], [331, 232]], [[352, 195], [352, 232]], [[380, 195], [380, 232]], [[420, 195], [420, 232]], [[448, 195], [448, 232]], [[480, 195], [480, 232]], [[541, 195], [541, 232]], [[598, 195], [598, 232]], [[655, 195], [655, 232]]]}]]

    abbyyTrainObj = {}
    $("body").on("click", ".tryTable", function () {
        $(".tryTable").parent().html('<button class="waves-effect waves-light btn-small mr-t-10 tryLines" onclick="return false;">Proceed</button><button class="waves-effect waves-light btn-small mr-t-10 tryRetry" onclick="return false;">Retry</button>')

        $(".tryLines").hide();
        table_cords = []
        $.each(tableFinalCrops, function (k, v) {
            $.each(v, function (kk, vv) {
                table_cords.push(vv)
            })
        })
        sendObj = {};
        sendObj.crop = table_cords[0];
        sendObj.page = table_cords[0].page;
        sendObj.file_name = file_id;
        sendObj.case_id = case_id;
        sendObj.flag = 'crop'
        sendObj.img_width = $(".HorZOn ").width();

        abbyyTrainObj = sendObj;

        nofiles = $(".imageCount").length;
        nextClicked = true;
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }

        sendObj.tenant_id = tenant_id
        //(sendObj);
        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/predict_with_ui_data",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(sendObj)
        };

        $.ajax(settings11).done(function (resp) {
            if (resp.flag) {
                table_data = resp.data.table[0][0];
                trainedTable = table_data
                lines_data = resp.data.table[0][1]['lines'];
                alias_data = resp.data.table[0][1]['alias'];

                showTable(table_data, alias_data)
                showLines(lines_data)
            } else if (!resp.flag) {
                $(".loading_full").hide();
                $.alert(resp.message, 'Alert');
            } else {
                $.alert('Something went wrong', 'Alert');
                $(".loading_full").hide();
            }
        });
    })

    $("body").on("click", ".tryRetry", function () {
        $(".header_crop").remove();
        nextClicked = false
        alt_title = 'table';
        table_train = true
        for (var i = 0; i < nofiles; i++) {
            width_ = $(".imagesCountNum" + i).width();
            $("#imageCountNum" + i).selectAreas({
                onChanged: debugHeaderAreas,
                width: width_,
                maxAreas: 1
            });

        }
    })

    $("body").on("click", ".tryLines", function () {
        $(".tryLines").parent().html('<button class="waves-effect waves-light btn-small mr-t-10 tryLines" onclick="return false;">Proceed</button><button class="waves-effect waves-light btn-small mr-t-10 tryRetry" onclick="return false;">Retry</button>')
        $(".tryLines").hide();

        hor_lines = $(".horizontal_line");
        hors = []
        for (var i = 0; i < hor_lines.length; i++) {
            obj = {};
            obj.x = Number(hor_lines[i].style.left.replace('px', ''));
            obj.y = Number(hor_lines[i].style.top.replace('px', ''));
            obj.width = Number(hor_lines[i].style.width.replace('px', ''));
            obj.height = Number(hor_lines[i].style.height.replace('px', ''));
            obj.color = hor_lines[i].attributes.color.value;
            obj.page = hor_lines[i].attributes.page.value;
            hors.push(obj)
        }

        ver_lines = $(".vertical_line");
        vers = [];
        for (var i = 0; i < ver_lines.length; i++) {
            obj = {};
            obj.x = Number(ver_lines[i].style.left.replace('px', ''));
            obj.y = Number(ver_lines[i].style.top.replace('px', ''));
            obj.width = Number(ver_lines[i].style.width.replace('px', ''));
            obj.height = Number(ver_lines[i].style.height.replace('px', ''));
            obj.color = ver_lines[i].attributes.color.value;
            obj.page = ver_lines[i].attributes.page.value;
            vers.push(obj)
        }

        headers = $(".tableHeader");
        ref = -1;
        for (var i = 0; i < headers.length; i++) {
            if (headers[i].children[0].children[0].children[0].checked) {
                ref = i
            }
        }

        sendObj = {};
        sendObj.page = vers[0].page;
        sendObj.lines = {};
        sendObj.lines.hors = hors;
        sendObj.lines.vers = vers;
        sendObj.file_name = file_id;
        sendObj.case_id = case_id;
        sendObj.flag = 'lines'
        sendObj.ref = ref;
        sendObj.img_width = $(".HorZOn ").width();
        sendObj.tenant_id = tenant_id
        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/predict_with_ui_data",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(sendObj)
        };

        $.ajax(settings11).done(function (resp) {
            if (resp.flag) {
                table_data = resp.data.table[0][0];
                showTable(table_data, alias_data)
            } else if (!resp.flag) {
                $(".loading_full").hide();
                $.alert(resp.message, 'Alert');
            } else {
                $.alert('Something went wrong', 'Alert');
                $(".loading_full").hide();
            }

        });
    })

    var tbll;

    function showTable(tbl, alias) {
        table_ = tbl;

        tr = '<div class="scroll_this"><table class="table">'
        for (var i = 0; i < table_.length; i++) {
            tr += '<tr>'
            for (var j = 0; j < table_[i].length; j++) {
                if (i == 0) {
                    opts = ''
                    for (var k = 0; k < forTable.length; k++) {
                        sel = ''
                        if (forTable[k] == alias[j]) {
                            sel = 'selected';
                        }
                        opts += '<option value="' + forTable[k] + '" ' + sel + '>' + forTable[k] + '</option>'
                    }
                    tr += '<td class="tableHeader" title="' + table_[i][j][0] + '" rowspan="' + table_[i][j][1] + '" colspan="' + table_[i][j][2] + '" style="min-width: 145px">'
                    tr += '<div class="pos_rl" del="no">'
                    tr += '<label class="ref">'
                    chk = 'checked'
                    tr += '<input class="with-gap" name="group1" type="radio" ' + chk + '/>'
                    tr += '<span>Ref key</span>'
                    tr += '</label>'
                    tr += '<img src="images/trash.svg" class="delete_col trash">'
                    tr += '<select class="tableAlias-' + j + '"><option value="">Select Alias</option>' + opts + '</select><br>' + table_[i][j][0]
                    tr += '</div>'
                    tr += '</td>'
                } else {
                    tr += '<td rowspan="' + table_[i][j][1] + '" colspan="' + table_[i][j][2] + '">' + table_[i][j][0] + '</td>'
                }
            }
            tr += '</tr>'
        }
        tr += '</table></div>'

        $(".allTableResults").html(tr)
        $("select").formSelect();
    }

    function showLines(lines) {
        // horzontal lines
        hors = lines.hors;
        for (var i = 0; i < hors.length; i++) {
            drawHorLines(hors[i], i)
        }

        // vertical lines
        vers = lines.vers;
        for (var i = 0; i < vers.length; i++) {
            drawVerLines(vers[i], i)
        }

    }

    $("body").on("dblclick", ".horizontal_line", function (e) {

        wrapper = $(this).parent();
        parentOffset = wrapper.offset();
        lft = e.pageX - parentOffset.left + wrapper.scrollLeft();
        initial_hor = []
        hor_init = $(".hor_gen_ver");
        for (var i = 0; i < hor_init.length; i++) {
            obj = {};
            obj.t = hor_init[i].offsetTop;
            obj.l = hor_init[i].offsetLeft;
            obj.w = hor_init[i].offsetWidth;
            obj.h = hor_init[i].offsetHeight;
            obj.page = hor_init[i].attributes['page'].value;
            initial_hor.push(obj);
        }

        id = $(this).attr('id');
        obj = {};
        y1 = $(this)[0].offsetTop + 5;
        if (id == 0) {
            y2 = $(".hor_gen_ver")[1].offsetTop + 5;
            obj.height = y2 - y1;
            obj.width = 10;
            obj.x = lft - 4;
            obj.y = y1;
            ////("---2----", $(".vertical_line").length);
            drawVerLines(obj, id);
        } else {
            if (id != 'sptl') {
                for (var i = 0; i < initial_hor.length - 1; i++) {
                    if (y1 >= initial_hor[i].t && y1 <= initial_hor[i + 1].t) {
                        if (i == 0) {
                            y2 = initial_hor[i + 2].t;
                        } else {
                            y2 = initial_hor[i + 1].t;
                        }

                    }
                }
            } else {
                y2 = $(".hor_gen_ver")[1].offsetTop + 5;
            }


            obj.height = y2 - y1 + 6;
            obj.width = 10;
            obj.x = lft - 7.5;
            obj.y = y1;
            ////("---split----", $(".vertical_line").length);
            drawVerLines(obj, id);
        }

    })

    $("body").on("dblclick", ".vertical_line", function (e) {
        obj = {};
        wrapper = $(this).parent();
        id = $(this).attr('id');
        parentOffset = wrapper.offset();
        lft = e.pageX - parentOffset.left + wrapper.scrollLeft();
        relY = e.pageY - parentOffset.top + wrapper.scrollTop();
        // lft = e.screenX - $(".HorZOn").offset().left + 1;
        obj.y = relY - 5;
        obj.x = lft;
        obj.width = initial_hor[0].w - lft + 15;
        obj.height = 12;
        ////(obj);
        drawHorLines(obj, id);

    })

    function adjtop(id) {
        adj_top = 0;
        for (var i = 0; i < id; i++) {
            adj_top += $('img.imageCountNum' + i).height();
        }
        return adj_top
    }

    function drawHorLines(points, i) {
        delll = '<i class="fa fa-trash delete_line del_hor" key="' + i + '" aria-hidden="true"></i>'
        $(".HorZOn").append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line' + i + '" color="' + points.color + '" page="' + points.page + '" id="' + i + '" style="top: ' + ((adjtop(points.page) + points.y) - 7) + 'px; left: ' + points.x + 'px; height: ' + (points.height + 14) + 'px; width: ' + points.width + 'px;"><div class="hor_line" style="background: ' + points.color + '">' + delll + '<img src="images/arrow.svg" alt="" class="left_move" width="15px"><img src="images/arrow.svg" alt="" class="right_move" width="15px"></div></div>');
        $(".delete_line").hide();

        resize_hor();
        drag_y();
        return '';
    }

    function drawVerLines(points, i) {
        $(".displayImages").width();
        $(".HorZOn").append('<div class="header_crop table_crop vertical_line vertical_line' + i + '" id="' + i + '" color="' + points.color + '" page="' + points.page + '" style="cursor: col-resize; top: ' + ((adjtop(points.page) + points.y) - 7) + 'px; left: ' + (points.x - 7) + 'px; height: ' + points.height + 'px; width: ' + points.width + 'px; z-index: 999;"><div class="ver_line" style="background: ' + points.color + '"><i class="fa fa-trash delete_line del_ver" key="' + i + '" aria-hidden="true"></i><img src="images/arrow.svg" width="15px" alt="" class="top_move"><img src="images/arrow.svg" width="15px" alt="" class="bottom_move"></div></div>')
        $(".delete_line").hide();
        resize_ver();
        drag_x();
        return '';
    }

    function resize_hor() {
        $(".horizontal_line").resizable({
            handles: "w, e",
            containment: $(".HorZOn"),
            minHeight: 5
        });
    }

    function drag_y() {
        $(".horizontal_line").draggable({
            axis: "y",
            containment: $(".HorZOn"),
            stop: function () {
                $(".tryLines").show()
            }
        });
    }

    function resize_ver() {
        $(".vertical_line").resizable({
            handles: "n, s",
            // containment: $(".HorZOn"),
            minHeight: 5

        });
    }

    function drag_x() {
        $(".vertical_line").draggable({
            axis: "x",
            containment: $(".HorZOn"),
            stop: function () {
                $(".tryLines").show()
            }
        });
    }

    $("body").on("click", ".del_ver", function () {
        $(this).parent().parent().remove();
    });

    $("body").on("click", ".del_hor", function () {
        $(this).parent().parent().remove();
    });

    $("body").on("click", ".saveBtn", function () {
        template_name = $(".template_name_val").val();
        // template_name = ""
        if ($.trim(template_name) != "") {
            temp_check = vendor_list.indexOf(template_name)
            procd = 0;
            if (temp_check == -1) {
                $.confirm({
                    title: 'Confirm',
                    content: 'Confirm with new provider?',
                    buttons: {
                        ok: function () {
                            saveFunc(template_name)
                        },
                        cancel: function () {}
                    }
                })
            } else {
                saveFunc(template_name)
            }
        }
    })

    function saveFunc(template_name) {
        tab = {};
        tab.table_data = {}
        tab.table_data.trained_data = table_data_final;

        mainDataToSend.table = [tab]

        mainDataToSend.trained_table = JSON.stringify(trainedTable);
        // //(mainDataToSend, JSON.stringify(mainDataToSend));
        if (retrain == 'yes') {
            mainDataToSend.template_name = template_name;
            mainDataToSend.file_name = file_id;
            mainDataToSend.case_id = case_id;
            mainDataToSend.img_width = $("#imageCountNum0").width();
            mainDataToSend.resize_factor = $("#imageCountNum0").width() / 670;
            mainDataToSend.retrain = retrain;
            mainDataToSend.user = user_name;
            mainDataToSend.temp_type = temp_check == -1 ? "new" : "old"
            mainDataToSend.tenant_id = tenant_id
            mainDataToSend.keywords = all_keywords_data;

            //(JSON.stringify(mainDataToSend));
            var form = new FormData();
            form.append("file", JSON.stringify(mainDataToSend));
            var settings11 = {
                "async": true,
                "crossDomain": true,
                "url": dynamicUrl + "/retrain",
                "method": "POST",
                "processData": false,
                "contentType": "application/json",
                "data": JSON.stringify(mainDataToSend)
            };
            $(".loading_full").show();
            $.ajax(settings11).done(function (msg) {
                $(".loading_full").hide();
                $(".template_name_modal").hide();
                //(msg);
                if (msg.flag) {
                    obj = {}
                    obj.template_name = template_name_retrain
                    obj.case_id = case_id;
                    obj.tenant_id = tenant_id
                    var settings11 = {
                        "async": true,
                        "crossDomain": true,
                        "url": dynamicUrl + "/extract_for_template",
                        "method": "POST",
                        "processData": false,
                        "contentType": "application/json",
                        "data": JSON.stringify(obj)
                    };
                    $(".loading_full").show();
                    $.ajax(settings11).done(function (msg) {
                        $(".loading_full").hide();
                        $.alert('Sucessfully Updated', 'Success');
                        setTimeout(function () {
                            closePage()
                        }, 1000);
                    })
                } else if ($.type(msg) == 'string') {
                    $.alert('Something went wrong', 'Alert');
                    $(".loading_full").hide();
                } else {
                    $(".loading_full").hide();
                    toast(msg.message, 'error');
                }
            }).fail(function (e) {
                $(".template_name_modal").hide()
                $.alert('Something went wrong', 'Alert');
            });
        } else {
            mainDataToSend.template_name = template_name;
            mainDataToSend.file_name = file_id;
            mainDataToSend.case_id = case_id;
            mainDataToSend.img_width = $("#imageCountNum0").width();
            mainDataToSend.resize_factor = $("#imageCountNum0").width() / 670;
            mainDataToSend.retrain = retrain;
            mainDataToSend.user = user_name;
            mainDataToSend.temp_type = temp_check == -1 ? "new" : "old"
            mainDataToSend.tenant_id = tenant_id
            mainDataToSend.keywords = all_keywords_data;

            //(mainDataToSend);
            var form = new FormData();
            form.append("file", JSON.stringify(mainDataToSend));
            var settings11 = {
                "async": true,
                "crossDomain": true,
                "url": dynamicUrl + "/train",
                "method": "POST",
                "processData": false,
                "contentType": "application/json",
                "data": JSON.stringify(mainDataToSend)
            };
            $(".loading_full").show();
            $.ajax(settings11).done(function (msg) {
                $(".loading_full").hide();
                $(".fieldsDisplayTest").html('');
                //(msg);

                if (msg.flag) {
                    $(".template_name_modal").hide()
                    $(".skipCheckModal").hide();
                    $.alert("Sucessfully Updated", 'Sucess');
                    closePage()
                } else if ($.type(msg) == 'string') {
                    $.alert('Something went wrong', 'Alert');
                    $(".loading_full").hide();
                } else {
                    $(".loading_full").hide();
                    $.alert(msg.message, 'Alert');
                }
            });
        }
    }
    // $(".forSave").attr("disabled", true);
    $('body').on("click", '.autoSuggest', function () {

        var dummydata = {
            "Billed To (DRL Name)": {
                "width": 74.6269,
                "height": 20.9403,
                "y": 100,
                "x": 100,
                "page": 0,
                "keyword": "Invoice is ",
                "value": "drl",
                "word": "Invoice is drl"
            },
            "Document Heading": {
                "width": 74.6269,
                "height": 20.9403,
                "y": 308,
                "x": 100,
                "page": 0,
                "keyword": "Invoice is ",
                "value": "drl",
                "word": "Invoice is drl"
            },
            "Invoice Category": {
                "width": 74.6269,
                "height": 20.9403,
                "y": 500,
                "x": 200,
                "page": 0,
                "keyword": "Invoice is ",
                "value": "drl",
                "word": "Invoice is drl"
            },
            "Invoice Po": {
                "width": 287,
                "height": 59,
                "y": 120,
                "x": 58,
                "page": 1,
                "keyword": "Invoice is ",
                "value": "drl",
                "word": "Invoice is drl"
            }
        }


        var id = 0;
        var target = "0";

        keywords_dummy = []
        crops_dummy = {}

        nofiles = $(".imageCount").length;
        alt_title = 'autosuggest'
        $.each(dummydata, function (k, v) {
            keywords_dummy.push(k)

            if (!nullCheck(crops_dummy[v.page])) {
                crops_dummy[v.page] = []
            }
            v.id = crops_dummy[v.page].length;
            id = crops_dummy[v.page].length;
            crops_dummy[v.page].push(v)

            addFields(id, 0, k, "fieldsAutoSuggest");
            box_id = id + "-" + selectedBox
            // get_Ocr(k.word, box_id)
            text_ = v.word
            $(".inputLabel-" + box_id).val(text_)
            $(".parent_input_here-" + box_id).html('');
            $(".parent_input_here-" + box_id).attr('title', text_)
            for (var i = 0; i < text_.length; i++) {
                $(".parent_input_here-" + box_id).append('<span class="span' + i + '">' + text_[i] + '</span>');
            }

            sliderdrag(box_id, "unlock");

        })
        autoSuggestFields(crops_dummy)
        $(".fieldTrain select").formSelect();
        $(".initial_view").hide();
        $(".autoSuggestView").show();
        fieldHistory = crops_dummy
        mandatoryFields = keywords_dummy;

    });
    $("body").on("click", ".closeAutoSuggest", function () {
        $('.fieldsAutoSuggest').html('')
        $(".initial_view").show()
        $(".autoSuggestView").hide();
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
        alt_title = 'header'
    })
    $("body").on("click", ".forSkip", function () {
        $(".skipCheckModal").show()
    })
    $('body').on('click', '.okSkipbtn', function () {
        // $(".forSave").attr("disabled", false);
        $('.forSkip').attr('disabled', true)
        $(".skipCheckModal").hide()
    })


    $("body").on("click", ".forSave", function () {
        if (retrain == 'yes') {
            $(".template_name_val").val(template_name_retrain)
        }
        headers = $(".tableHeader");
        table_data_final = {}
        for (var i = 0; i < headers.length; i++) {
            table_data_final['v' + (i + 1)] = {}
            table_data_final['v' + (i + 1)].label = $.trim(headers[i].attributes.title.value) //header
            table_data_final['v' + (i + 1)].del = $.trim(headers[i].children[0].attributes.del.value) //del
            table_data_final['v' + (i + 1)].alias = $(".tableAlias-" + i).val() //alias
            table_data_final['v' + (i + 1)].ref = headers[i].children[0].children[0].children[0].checked //alias

        }

        $(".template_name_modal").show()
    })

    $("body").on("click", ".closeBtn", function () {
        closePage()
    })

    function closePage() {
        docUrl = (window.location != window.parent.location) ? document.referrer : document.location.href
        docArr = docUrl.split('/');
        url_ = ''
        for (i = 0; i < 6; i++) {
            url_ += docArr[i] + '/';
        }
        window.top.location = url_;
    }

    $("body").on("click", ".swaping", function () {
        id = $(this).attr('key');
        target = $(this).attr('target');
        a = $(".keyword-final-" + id + "-" + target).val()
        b = $(".value-final-" + id + "-" + target).val()

        $(".keyword-final-" + id + "-" + target).val(b);
        $(".value-final-" + id + "-" + target).val(a)

        if (nullCheck(fieldHistory[id + "-" + target])) {
            if (nullCheck(field_crop_flag)) {
                field_crop_flag = undefined;
                nextClicked = true
                for (var i = 0; i < nofiles; i++) {
                    $('#imageCountNum' + i).selectAreas('destroy');
                }
            }
            vv = fieldHistory[id + "-" + target][0]
            kk = fieldHistory[id + "-" + target][1]
            fieldHistory[id + "-" + target][0] = kk
            fieldHistory[id + "-" + target][1] = vv

            for (var i = 0; i < nofiles; i++) {
                clickedAreas = [];
                nextClicked = false;
                for (var j = 0; j < fieldHistory[id + "-" + target].length; j++) {
                    if (fieldHistory[id + "-" + target][j].page == i) {
                        obj = {}
                        obj.x = fieldHistory[id + "-" + target][j]['x']
                        obj.y = fieldHistory[id + "-" + target][j]['y']
                        obj.width = fieldHistory[id + "-" + target][j]['width']
                        obj.height = fieldHistory[id + "-" + target][j]['height']
                        obj.page = fieldHistory[id + "-" + target][j]['page']
                        obj.type = fieldHistory[id + "-" + target][j]['type']

                        // if (fieldHistory[id+"-"+target][j].record != 'new') {
                        //     obj.record = 'old'
                        // }
                        // else {
                        //     obj.record = 'new'
                        // }

                        clickedAreas.push(obj)
                    }
                }

                field_crop_flag = $("#imageCountNum" + i).selectAreas({
                    onChanged: debugFieldAreas,
                    onReset: debugDeleteAreas,
                    width: width_,
                    maxAreas: 2,
                    areas: clickedAreas,
                    keyShow: true
                });
            }


        }
    })


    function get_Ocr(reslt, box_id, x) {
        text = '';
        for (var i = 0; i < reslt.length; i++) {
            text = text + ' ' + reslt[i].word;
        }
        text_ = $.trim(text);
        if (x == 'value') {
            clss = 'value-final'
        } else {
            clss = 'keyword-final'
        }

        $("." + clss + "-" + box_id).val(text_)
        $("." + clss + "-" + box_id).attr("title", text_)
    }

    $('body').on('change', '.optionss', function () {
        displayFieldsMain()
    });

    function displayFieldsMain() {
        showFieldTrain = true;
        alt_title = 'field'
        nextClicked = false;

        $("<p class='indication_font mr-b-10'>Select Field to Crop <input type='text' class='searchFields' placeholder='Search Fields'></p>").insertBefore(".displayresults");
        var count = 0;
        fields_p = predicted_data
        for (var i = 0; i < fields_p.length; i++) {
            count = count + 1;
            predicted_obj = fields_p[i];
            // class_name = predicted_obj.field.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_');
            class_name = 'group_main';
            pg = predicted_obj.coordinates.length > 0 ? predicted_obj.coordinates[0].page : 0
            addFields(i, 0, fields_p[i].field, class_name, count, predicted_obj, fields_p[i].field)
        }

        $('#inv_category_indicator').hide();
        $("select").formSelect();
    }

    $("body").on("mouseover", ".outputBody .units", function () {
        // if ($(this).parent().hasClass("show")) {
        // $(this).parent().removeClass("show")
        // }
        // else {
        $(".units").removeClass("show")
        $(this).addClass("show")
        // }
    })
    $("body").on("mouseout", ".outputBody .units", function () {
        // if ($(this).parent().hasClass("show")) {
        $(this).removeClass("show")
        // }
        // else {
        // $(".units").removeClass("show")
        // $(this).parent().addClass("show")
        // }
    })

    $("body").on("click", ".addDi", function () {
        $(".all_dis").append('<select class="di_select">' + d_i_opts + '</select>');
        $("select").formSelect();
    })


    $("body").on('click', '.expandClick', function () {
        $(this).parent().parent().hasClass('expanded') ? $(this).parent().parent().removeClass('expanded') : $(this).parent().parent().addClass('expanded')
    })

    $('body').on('click', '.keywordSelect', function () {
        // if (alt_title != 'autosuggest') {
        det_delete = false
        clicked_id = $(this).closest(".fieldTrain").attr("id");
        for (var i = 0; i < imagefiles_.length; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
        }
        selectedBox = $(this).attr('group');
        target = $(this).closest(".fieldTrain").attr("target");
        field = $(this).closest(".fieldTrain").attr("field");
        boxClick(clicked_id, target)

        setTimeout(function () {
            det_delete = false
            startAreas();
        }, 500);
        // }
    })

    function boxClick(id, target) {
        // zoom = 100;
        // $(".HorZOn").css("width", zoom+'%');
        if (!$(".recd-" + id + "-" + selectedBox).find('.outputBody').hasClass('selected')) {
            $(".fieldTrain").find('.outputBody').removeClass('selected').addClass('op-p5')
            $(".recd-" + id + "-" + selectedBox).find('.outputBody').addClass('selected').removeClass('op-p5')
        }
    }

    function startAreas() {

        opts = ''
        var arrLen = field_areas_obj[clicked_id + "-" + selectedBox].length > 1 ? 1 : dropDown_add.length
        for (let i = 0; i < arrLen; i++) {
            opts += '<p class="add_select_val">' + dropDown_add[i].name + '</p>'
        }

        sessionStorage.setItem('cropOpts', opts)

        for (var i_i = 0; i_i < imagefiles_.length; i_i++) {
            width_ = $("#imageCountNum" + i_i).width();
            ar_ = [];
            if (field_areas_obj[clicked_id + "-" + selectedBox] && field_areas_obj[clicked_id + "-" + selectedBox].length > 0) {
                if (field_areas_obj[clicked_id + "-" + selectedBox][0].page == i_i) {
                    ar_ = field_areas_obj[clicked_id + "-" + selectedBox]
                }
            }

            det_delete = true;
            arLen = ar_.length > 0 ? ar_.length : 1
            $("#imageCountNum" + i_i).selectAreas({
                onChanged: debuggFieldingAreas,
                onChanging: changingAreas,
                width: width_,
                allowDelete: true,
                numbering: true,
                maxAreas: arLen,
                addOptions: opts,
                addPlus: true,
                areas: ar_
            });
        }

        topScroll = 0;

        addLines(field_areas_obj[clicked_id + "-" + selectedBox])

    }
    debuggFieldingAreas = function debuggFieldingAreas(event, id, areas) {
        if (det_delete) {
            field_areas_obj[clicked_id + "-" + selectedBox] = areas;
            for (let i = 0; i < areas.length; i++) {
                word = getWord(rte(areas[i], $("#imageCountNum0").width()))
                areas[i].word = word
                if (i == 0) {
                    $(".value-final-" + clicked_id + "-" + selectedBox).val(word)
                }
            }
            addLines(areas)
        }
    }


    timer = 0;
    changingAreas = function changingAreas(event, id, areas) {
        if (det_delete) {
            addLines(areas)
        }
        ii = areas.findIndex(x => x.id == id);
        word = getWord(rte(areas[ii], $("#imageCountNum0").width()))
        $(".displayCropWord").html(word)

        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }

        $('.displayCropWord').fadeIn();
        timer = setTimeout(function () {
            $('.displayCropWord').fadeOut()
        }, 3000)

    }
    changingAllAreas = function changingAllAreas(event, id, areas) {
        ii = areas.findIndex(x => x.id == id);
        word = getWord(rte(areas[ii], $("#imageCountNum0").width()))
        $(".displayCropWord").html(word)

        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }

        $('.displayCropWord').fadeIn();
        timer = setTimeout(function () {
            $('.displayCropWord').fadeOut()
        }, 3000)
    }

    function addLines(areas) {
        $('.line').remove()

        for (let i = 0; i < areas.length; i++) {
            ex_top = 0;
            areas[i].page = Number(areas[i].page);
            for (var j = 0; j < areas[i].page; j++) {
                ex_top += $(".imageCountNum" + j).height();
            }

            if (areas[i].parent != undefined) {
                box1_x1 = areas[i].x
                box1_x2 = areas[i].x + areas[i].width;
                box1_y1 = areas[i].y
                box1_y2 = areas[i].y + areas[i].height;

                box2_x1 = areas[areas[i].parent].x
                box2_x2 = areas[areas[i].parent].x + areas[areas[i].parent].width;
                box2_y1 = areas[areas[i].parent].y
                box2_y2 = areas[areas[i].parent].y + areas[areas[i].parent].height;

                x1 = (box1_x1 + box1_x2) / 2;
                y1 = (box1_y1 + box1_y2) / 2 + ex_top;
                x2 = (box2_x1 + box2_x2) / 2;
                y2 = (box2_y1 + box2_y2) / 2 + ex_top;

                $('#add_lines').line(x1, y1, x2, y2, {
                    "color": "red",
                    "zindex": 0
                });
            }

        }
    }

    function getWord(params) {
        text = ''
        for (let i = 0; i < params.length; i++) {
            text += ' ' + params[i].word;
        }
        return $.trim(text)
    }

    $('body').on('click', '.plus_icon', function () {
        var check_Class = $(this).parent().find('.add_select').hasClass('select_class')
        if (check_Class) {
            $(this).parent().find('.add_select').removeClass('select_class')
        } else {
            $(this).parent().find('.add_select').addClass('select_class')
        }
    })

    $('body').on('click', '.add_select_val', function () {
        var list_val = $(this).text();
        $(this).removeClass('select_class')
        var id = $(this).parent().attr('id');
        var lastId = field_areas_obj[clicked_id + "-" + selectedBox].findIndex(x => x.id == id)
        field_areas_obj[clicked_id + "-" + selectedBox][lastId].child = [];
        field_areas_obj[clicked_id + "-" + selectedBox][lastId]['dropdown_value'] = list_val;
        var ars = field_areas_obj[clicked_id + "-" + selectedBox][lastId]

        var idx = dropDown_add.findIndex(x => x.name == list_val);
        var temp_positions = dropDown_add[idx].position;
        areaCount += dropDown_add[idx].crops;
        for (let i = 0; i < temp_positions.length; i++) {
            temp_ars = Object.assign({}, ars);
            ad_x = temp_positions[i].left > 0 ? temp_ars.width : -temp_ars.width;
            ad_y = temp_positions[i].top > 0 ? temp_ars.height : 0;
            lft__ = temp_ars.x + temp_positions[i].left + ad_x;
            top__ = temp_ars.y + temp_positions[i].top + ad_y;

            temp_ars.x = lft__ < 1 ? 2 : lft__;
            temp_ars.y = top__ < 1 ? 2 : top__;
            temp_ars.width = temp_positions[i].width;
            temp_ars.height = temp_positions[i].height;
            temp_ars.parent = lastId;
            temp_ars.child = [];
            temp_ars['dropdown_value'] = ''

            word = getWord(rte(temp_ars, $("#imageCountNum0").width()))
            temp_ars.word = word
            field_areas_obj[clicked_id + "-" + selectedBox].push(temp_ars)
            field_areas_obj[clicked_id + "-" + selectedBox][lastId].child.push(field_areas_obj[clicked_id + "-" + selectedBox].length - 1)
        }

        destroyAreas();
    })

    function destroyAreas() {
        det_delete = false;
        for (var i = 0; i < imagefiles_.length; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
        }
        // setTimeout(() => {
        det_delete = true;
        startAreas()
        // }, 0);
    }

    $('body').on('click', '.delete-area', function () {
        index = Number($(this).attr('id'))
        let newDelList = get_all_ids(index);
        newDelList = newDelList.sort(function (a, b) {
            return b - a
        });
        idx = field_areas_obj[clicked_id + '-' + selectedBox].findIndex(x => x.id === index)
        try {
            parent_id = field_areas_obj[clicked_id + '-' + selectedBox][idx].parent;
        } catch (error) {
            parent_id = undefined;
        }
        for (let i = 0; i < newDelList.length; i++) {
            field_areas_obj[clicked_id + '-' + selectedBox].splice(newDelList[i], 1);
        }
        if (parent_id != undefined) {
            updateAreas(parent_id);
        }

        destroyAreas();
    })

    function updateAreas(parent_id) {
        var newChild = []
        for (let n_i = 0; n_i < field_areas_obj[clicked_id + '-' + selectedBox].length; n_i++) {
            if (field_areas_obj[clicked_id + '-' + selectedBox][n_i].parent == parent_id) {
                newChild.push(n_i++)
            }
        }
        field_areas_obj[clicked_id + '-' + selectedBox][parent_id].child = newChild
    }

    function get_children(parent_index) {
        try {
            return field_areas_obj[clicked_id + '-' + selectedBox][parent_index]["child"]
        } catch (error) {
            return []
        }
    }

    function hasChild(parent_index) {
        try {
            return field_areas_obj[clicked_id + '-' + selectedBox][parent_index]["child"].length > 0
        } catch (error) {
            return false
        }
    }

    function get_all_ids(parent_index) {
        let all_ids = []
        all_ids.push(parent_index)
        if (hasChild(parent_index)) {
            let children_ids = get_children(parent_index)
            for (let i = 0; i < children_ids.length; i++) {
                let child = children_ids[i]
                let all_child_ids = get_all_ids(child)
                for (let j = 0; j < all_child_ids.length; j++) {
                    all_ids.push(all_child_ids[j])
                }
            }
        }
        return all_ids
    }

    function trainAddedFields(id, target, areaCount) {
        // $('.delete-area').css('display', 'none');
        // $('.select-areas-delete-area').css('display', 'none');
        width_ = $("#imageCountNum0").width();
        nofiles = $(".imageCount").length
        field_name = $(".keyword-" + id + "-" + target).text();
        topScroll = 0
        if (alt_title = 'field') {
            for (var i = 0; i < nofiles; i++) {
                clickedAreas = [];
                nextClicked = false;
                if (nullCheck(fieldHistory[id + "-" + target])) {
                    for (var j = 0; j < fieldHistory[id + "-" + target].length; j++) {
                        if (fieldHistory[id + "-" + target][j].page == i) {
                            obj = {}
                            obj.id = j + 1;
                            obj.x = fieldHistory[id + "-" + target][j]['x']
                            obj.y = fieldHistory[id + "-" + target][j]['y']
                            obj.width = fieldHistory[id + "-" + target][j]['width']
                            obj.height = fieldHistory[id + "-" + target][j]['height']
                            obj.page = fieldHistory[id + "-" + target][j]['page'];
                            obj.type = fieldHistory[id + "-" + target][j]['type']
                            obj.parent = fieldHistory[id + "-" + target][j]['parent']
                            obj.child = fieldHistory[id + "-" + target][j]['child']
                            obj.dropdown_value = fieldHistory[id + "-" + target][j]['dropdown_value']
                            obj.word = fieldHistory[id + "-" + target][j]['word'];

                            pg_t = 0;
                            if (Number(obj.page) > 0) {
                                for (p_i = 0; p_i < obj.page; p_i++) {
                                    pg_t += $(".imageCountNum" + p_i).height();
                                }
                            }
                            topScroll = obj.y + pg_t
                            // if (fieldHistory[id+"-"+target][j].record != 'new') {
                            //     obj.record = 'old'
                            // }
                            // else {
                            //     obj.record = 'new'
                            // }

                            clickedAreas.push(obj)
                        }
                    }
                } else {
                    topScroll = null
                }
                field_crop_flag = $("#imageCountNum" + i).selectAreas({
                    onChanged: debugFieldAreas,
                    width: width_,
                    maxAreas: areaCount,
                    areas: clickedAreas,
                    keyShow: true,
                    allowDelete: 'delete',
                    addPlus: false,
                    numbering: false,
                });
            }
            if (topScroll != null) {
                // $(".showImgs").animate({
                //     scrollTop: (topScroll - 300)
                // }, 500)
            }
        }

    }

    function autoSuggestFields(cropped_areas) {
        width_ = $(".imagesCountNum0").width();
        for (var i = 0; i < nofiles; i++) {
            clickedAreas = [];
            field_crop_flag = $("#imageCountNum" + i).selectAreas({
                onChanged: debugHeaderAreas,
                width: width_,
                areas: cropped_areas[i],
            });
        }
    }

    function addFields(id, target, field_name, class_name_field, count, predicted_obj, kywd_) {
        kywd = kywd_.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
        tr = '<div class="fieldTrain pos_rl recd-' + id + '-' + kywd + '" id="' + id + '" field="' + field_name + '" split="no" target="' + kywd + '" c="' + count + '"  ty="new">'
        tr += '<div class="outputBody headerBox">'
        tr += '<div class="row fieldValid-' + id + '-' + kywd + '" style="height: 30px !important;">'
        tr += '<div class="col-sm-5 padding0">'
        tr += '<p first="yes" group="' + kywd + '" class="mods_inputs keywordSelect keyword-' + id + '-' + kywd + ' pointer" title="' + field_name + '" field="' + field_name + '">' + field_name.replace(/_/g, ' ') + '</p>'
        tr += '</div>'
        tr += '<div class="col-sm-6 padding0">'
        value_ = predicted_obj['value'];
        tr += '<input type="text" class="mods_inputs value-final-' + id + '-' + kywd + '" placeholder="Value" value="' + value_ + '">'
        tr += '</div > '
        tr += '<div class="col-sm-1 padding0">'
        // UNITS VIEW
        if (tab_field_def[kywd_]) {
            tr += '<div class="units"> '
            tr += '<img src="images/dropdown-circle.svg" class="unitDropIcon">'
            tr += '<div class="unitOpts">'
            for (let t = 0; t < tab_field_def[kywd_].length; t++) {
                unit_obj = tab_field_def[kywd_][t];
                tr += '<div>'
                tr += '<span class="label_">' + unit_obj.display_name + '</span>'
                if (unit_obj.type == 'dropdown') {
                    tr += '<select field="' + field_name + '" unique_name="' + unit_obj.unique_name + '" class="unitSelect unitSelect-' + unit_obj.unique_name.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_') + '" key="' + kywd_ + '">'
                    tr += '<option value = "" >Select Unit</option>'
                    for (let gci = 0; gci < groupCurrencyOpts[unit_obj.unique_name].length; gci++) {
                        selected = ''
                        if (gci == 0) {
                            selected = 'selected'
                        }
                        tr += '<option value="' + groupCurrencyOpts[unit_obj.unique_name][gci].dropdown_option + '" ' + selected + '>' + groupCurrencyOpts[unit_obj.unique_name][gci].dropdown_option + '</option>';
                    }
                    tr += '</select>'
                } else if (unit_obj.type == 'text') {
                    tr += '<input type="text" unique_name="' + unit_obj.unique_name + '" class="unitSelect unitSelect-' + unit_obj.unique_name + '" key="' + kywd_ + '">'
                }
                tr += '</div>'
            }

            tr += '</div>'
            tr += '</div>'
        }


        // UNITS VIEW

        tr += '</div > '
        tr += '</div>'
        tr += '<div class="row s99p keyValRow-' + id + '-' + kywd + '">'
        tr += '</div>'

        tr += '</div>'
        tr += '</div>'
        $("." + class_name_field).append(tr);
        sessionStorage.setItem('validation-' + id + '-' + kywd, JSON.stringify({
            "pattern": "NONE",
            "globalCheck": false
        }));
    }

    $("body").on("click", ".backToHeader", function () {
        nofiles = $(".imageCount").length;
        if (!nullCheck(all_cropped_data_history['field'])) {
            all_cropped_data_history['field'] = {};
        }
        for (var i = 0; i < nofiles; i++) {
            all_cropped_data_history['field'][i] = $('#imageCountNum' + i).selectAreas('areas');
            $('#imageCountNum' + i).selectAreas('destroy');
        }

        if (nullCheck(all_cropped_data_history['header'])) {
            header_areas = all_cropped_data_history['header'];
        } else {
            header_areas = []
        }

        alt_title = 'header'

        for (var i = 0; i < nofiles; i++) {
            width_ = $(".imagesCountNum" + i).width();
            $("#imageCountNum" + i).selectAreas({
                onChanged: debugHeaderAreas,
                width: width_,
                areas: header_areas[i]
            });
        }
        //(all_cropped_data_history);
    });

    function rte(box, w) {
        //(box, w,"box");
        key = box['page'];
        ui_box = Object.assign({}, box);
        words_in_box = [];
        resize_factor1 = w / default_width;

        ui_box["width"] = Number(ui_box["width"] / resize_factor1)
        ui_box["height"] = Number(ui_box["height"] / resize_factor1)
        ui_box["y"] = Number(ui_box["y"] / resize_factor1)
        ui_box["x"] = Number(ui_box["x"] / resize_factor1)

        box_t = ui_box['y']
        box_r = ui_box['x'] + ui_box['width']
        box_b = ui_box['y'] + ui_box['height']
        box_l = ui_box['x']

        words_in_box = []
        // img_ocr_data = JSON.parse(localStorage.getItem('ocr'))
        for (var i = 0; i < img_ocr_data[key].length; i++) {
            word_t = img_ocr_data[key][i]['top']
            word_r = img_ocr_data[key][i]['left'] + img_ocr_data[key][i]['width']
            word_b = img_ocr_data[key][i]['top'] + img_ocr_data[key][i]['height']
            word_l = img_ocr_data[key][i]['left']
            if ((box_l <= word_l && word_r <= box_r) && (box_t <= word_t && word_b <= box_b)) {
                words_in_box.push(img_ocr_data[key][i])
            }
        }
        ////(words_in_box);
        return words_in_box;
    }

    function table_rte(box, imgWidth) {
        key = nullCheck(box.page) ? box.page : 0;
        ui_box = Object.assign({}, box);
        words_in_box = [];
        resize_factor1 = imgWidth / default_width;

        ui_box["w"] = Number(ui_box["w"] / resize_factor1)
        ui_box["h"] = Number(ui_box["h"] / resize_factor1)
        ui_box["t"] = Number(ui_box["t"] / resize_factor1)
        ui_box["l"] = Number(ui_box["l"] / resize_factor1)

        box_t = ui_box['t']
        box_r = ui_box['l'] + ui_box['w']
        box_b = ui_box['t'] + ui_box['h']
        box_l = ui_box['l']

        words_in_box = []
        // img_ocr_data = JSON.parse(localStorage.getItem('ocr'))
        for (var i = 0; i < img_ocr_data[key].length; i++) {
            word_t = img_ocr_data[key][i]['top']
            word_r = img_ocr_data[key][i]['left'] + img_ocr_data[key][i]['width']
            word_b = img_ocr_data[key][i]['top'] + img_ocr_data[key][i]['height']
            word_l = img_ocr_data[key][i]['left']
            if ((box_l - (0.25 * img_ocr_data[key][i]['width']) <= word_l && word_r <= box_r + (0.25 * img_ocr_data[key][i]['width'])) && (box_t <= word_t && word_b <= box_b)) {
                words_in_box.push(img_ocr_data[key][i])
            }
        }
        return words_in_box;
    }
    //All needed from plugins

    //pdf to image
    function previewPdfFile(file) {
        loadXHR(file).then(function (blob) {
            var reader = new FileReader();
            reader.onload = function (e) {
                pdftoimg(e.target.result)
            }
            reader.readAsDataURL(blob);
        });
    }

    function loadXHR(url) {
        return new Promise(function (resolve, reject) {
            try {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url);
                xhr.responseType = "blob";
                xhr.onerror = function () {
                    reject("Network error.")
                };
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(xhr.response)
                    } else {
                        reject("Loading error:" + xhr.statusText)
                    }
                };
                xhr.send();
            } catch (err) {
                reject(err.message)
            }
        });
    }

    function pdftoimg(file) {
        imagesArr = [];
        window.PDFJS = window.pdfjsLib;
        PDFJS.disableWorker = true;
        PDFJS.getDocument(file).then(function getPdf(pdf) {
            const go = async function () {
                let h = 0;
                for (var pageN = 1; pageN <= pdf.numPages; pageN++) {
                    const page = await pdf.getPage(pageN);
                    var scale = 2;
                    var viewport = page.getViewport(scale);
                    //
                    // Prepare canvas using PDF page dimensions
                    //
                    var canvas = document.createElement('canvas');
                    //document.body.appendChild(canvas);
                    var context = canvas.getContext('2d');
                    canvas.height += viewport.height;
                    canvas.width = viewport.width;
                    //
                    // Render PDF page into canvas context
                    //
                    var task = page.render({
                        canvasContext: context,
                        viewport: viewport
                    })
                    await task.promise;
                    pages = canvas.toDataURL('image/jpeg');
                    imagesArr.push(pages)
                    if (pageN == pdf.numPages) {
                        displayImage(imagesArr)
                    }
                }
            };
            go();
        }, function (error) {
            $(".loading_full").hide();
            $.alert('Something went wrong', 'Error');

            ////(error);
        });
    }

    // tiff to image
    function previewTiffFile(file) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open('GET', file);
        xhr.onload = function (e) {
            var tiff = new Tiff({
                buffer: xhr.response
            });
            imagefiles = [];
            tiff_count = tiff.countDirectory();
            ////(tiff_count);
            for (var i = 0; i < tiff_count; i++) {
                tiff.setDirectory(i);
                var canvas = tiff.toCanvas();
                imagefiles.push(canvas.toDataURL())
                ////(tiff.countDirectory(), imagefiles);
            }
            var canvas = tiff.toCanvas();
            displayImage(imagefiles)
            // ////(canvas.toDataURL());
        };
        xhr.send();
    }

    $("body").on("click", ".delete_col", function () {
        del = $(this).hasClass('trash');
        if (del) {
            id = $(this).parent().attr('id')
            // delete table_alias_already_selected[id];
            $(this).parent().addClass('disabledcol');
            $(this).removeClass('trash');
            $(this).attr('src', 'images/redo-solid.svg');
            $(this).addClass('repeat');
            $(this).parent().attr('del', 'yes')
        } else {
            $(this).parent().removeClass('disabledcol');
            $(this).removeClass('repeat');
            $(this).attr('src', 'images/trash.svg');
            $(this).addClass('trash');
            $(this).parent().attr('del', 'no')
        }
    })

    selectedExtraCrop = ''
    selectedExtraCropBox = '';
    changedAreasCount = []

    $("body").on("click", ".croping2d", function () {
        extracropcount = 0;
        $(".invoiceName").html(file_name)
        id = $(this).attr('key');
        target = $(this).attr('target');
        splitId = $(this).attr('split');

        key = id + '-' + target
        if (nullCheck(splitId)) {
            key += '-' + splitId
        }
        selectedExtraCropBox = key

        extraTrainingFields[key] = {}
        extraTrainingFields[key].type = '2D';
        extraTrainingFields[key].coordinates = [];
        //(extraTrainingFields)
        imgs = $(".imageCount")
        for (var i = 0; i < imgs.length; i++) {
            $(".displayHereImages").append('<img src="' + imgs[i].attributes.src.value + '" id="imgCount-' + i + '" class="newImgCount imgCount-' + i + '" alt="' + i + '" width="100%">')
            //(imgs[i].attributes.src.value);
        }

        for (var i = 0; i < imgs.length; i++) {
            width_ = $("#imgCount-" + i).width();

            $("#imgCount-" + i).selectAreas({
                onChanged: debugAreas,
                width: width_,
                maxAreas: 4
            });
        }

        $(".extraTrainingDiv").show()
        t_ = 0;
        for (var i = 0; i < target; i++) {
            t_ += $('imgCount-' + i).height();
        }
        allCrops = $('#imageCountNum' + target).selectAreas('areas')
        oldWidth = $('#imageCountNum' + target).width();
        crp = allCrops[id];
        w = newCord(crp['width'])
        h = newCord(crp['height'])
        t = newCord(crp['y']) + t_
        l = newCord(crp['x'])
        $(".highlighted").remove();
        $(".displayHereImages").append('<div class="highlighted" style="left:' + l + 'px; top:' + t + 'px; width:' + w + 'px; height:' + h + 'px; "></div>')

    })

    $("body").on("click", ".cropingContext", function () {
        extracropcount = 0;
        $(".invoiceName").html(file_name)
        id = $(this).attr('key');
        target = $(this).attr('target');
        splitId = $(this).attr('split');

        key = id + '-' + target
        if (nullCheck(splitId)) {
            key += '-' + splitId
        }
        selectedExtraCropBox = key

        extraTrainingFields[key] = {}
        extraTrainingFields[key].type = 'Context';
        extraTrainingFields[key].coordinates = [];
        //(extraTrainingFields)

        imgs = $(".imageCount")
        for (var i = 0; i < imgs.length; i++) {
            $(".displayHereImages").append('<img src="' + imgs[i].attributes.src.value + '" id="imgCount-' + i + '" class="newImgCount imgCount-' + i + '" alt="' + i + '" width="100%">')
            //(imgs[i].attributes.src.value);
        }

        for (var i = 0; i < imgs.length; i++) {
            width_ = $("#imgCount-" + i).width();

            $("#imgCount-" + i).selectAreas({
                onChanged: debugAreas,
                width: width_,
                maxAreas: 1
            });
        }

        $(".extraTrainingDiv").show()
        t_ = 0;
        for (var i = 0; i < target; i++) {
            t_ += $('imgCount-' + i).height();
        }
        allCrops = $('#imageCountNum' + target).selectAreas('areas')
        oldWidth = $('#imageCountNum' + target).width();
        crp = allCrops[id];
        w = newCord(crp['width'])
        h = newCord(crp['height'])
        t = newCord(crp['y']) + t_
        l = newCord(crp['x'])
        $(".highlighted").remove();
        $(".displayHereImages").append('<div class="highlighted" style="left:' + l + 'px; top:' + t + 'px; width:' + w + 'px; height:' + h + 'px; "></div>')

    })
    var select_id, select_traget;
    $("body").on("click", ".cropingFT", function () {
        extracropcount = 1;
        $(".invoiceName").html(file_name)
        id = $(this).attr('key');
        select_id = id;
        target = $(this).attr('target');
        splitId = $(this).attr('split');

        key = id + '-' + target
        if (nullCheck(splitId)) {
            key += '-' + splitId
        }
        selectedExtraCropBox = key

        extraTrainingFields[key] = {}
        extraTrainingFields[key].type = 'FT';
        extraTrainingFields[key].coordinates = [];
        //(extraTrainingFields)
        imgs = $(".imageCount")
        for (var i = 0; i < imgs.length; i++) {
            $(".displayHereImages").append('<img src="' + imgs[i].attributes.src.value + '" id="imgCount-' + i + '" class="newImgCount imgCount-' + i + '" alt="' + i + '" width="100%">')
            //(imgs[i].attributes.src.value);
        }

        for (var i = 0; i < imgs.length; i++) {
            width_ = $("#imgCount-" + i).width();

            $("#imgCount-" + i).selectAreas({
                onChanged: debugAreas,
                width: width_,
                maxAreas: 4
            });
        }

        $(".extraTrainingDiv").show()
        t_ = 0;
        for (var i = 0; i < target; i++) {
            t_ += $('imgCount-' + i).height();
        }
        allCrops = $('#imageCountNum' + target).selectAreas('areas')
        oldWidth = $('#imageCountNum' + target).width();
        crp = allCrops[id];
        w = newCord(crp['width'])
        h = newCord(crp['height'])
        t = newCord(crp['y']) + t_
        l = newCord(crp['x'])
        $(".highlighted").remove();
        $(".displayHereImages").append('<div class="highlighted" style="left:' + l + 'px; top:' + t + 'px; width:' + w + 'px; height:' + h + 'px; "></div>')

    })

    function newCord(value) {
        oldWidth = $('#imageCountNum0').width();
        newWidth = $("#imgCount-0").width();
        return value * (newWidth / oldWidth)
    }

    function newCord1(value) {
        oldWidth = $('#imageCountNum0').width();
        newWidth = $("#imgCount-0").width();
        return value * (oldWidth / newWidth)
    }

    debugAreas = function debugAreas(event, id, areas) {
        target = event.target.alt;
        select_traget = target;
        $('.close-' + id + '-' + target).remove();
        if (nullCheck(areas[id])) {
            areas[id].page = target;

            rteData = rte(areas[id], $("#imgCount-0").width());

            //(rteData);
            // rteData = rte();
            text = '';

            for (var i = 0; i < rteData.length; i++) {
                text = text + ' ' + rteData[i].word;

            }
            text_ = $.trim(text);

            if ($(".freeText-" + id + "-" + target).length == 0) {
                $(".displayHereContent").append('<div class="freeText freeText-' + id + '-' + target + '" id="freeText-' + id + '-' + target + '">' + text_ + '</div>')
            } else {
                $(".freeText-" + id + "-" + target).html(text_)
            }
            if (extracropcount == 1) {
                $('.freeText-' + id + '-' + target).append('<select class="display_block change_select close-' + id + '-' + target + '" id="change_Select_' + id + '" this><option>Top</option><option>Bottom</option><option>Left</option><option>Right</option></select>')
            }

        }
        changedAreasCount = areas
        //("debugAreas", text, event, id, JSON.stringify(areas), extraTrainingFields[selectedExtraCropBox])
    }

    $("body").on("click", ".extraTrainingDivCancel", function () {
        changedAreasCount = []
        for (var i = 0; i < imgs.length; i++) {
            width_ = $("#imgCount-" + i).width();

            $("#imgCount-" + i).selectAreas('destroy');
        }

        $(".recd-" + selectedExtraCropBox).find('.extraCrps').removeClass('active');

        if (extraTrainingFields[selectedExtraCropBox].type == '2D' && extraTrainingFields[selectedExtraCropBox].coordinates.length > 0) {
            $(".recd-" + selectedExtraCropBox).find('.croping2d').addClass('active');
        } else if (extraTrainingFields[selectedExtraCropBox].type == 'Context' && extraTrainingFields[selectedExtraCropBox].coordinates.length > 0) {
            $(".recd-" + selectedExtraCropBox).find('.cropingContext').addClass('active');
        } else if (extraTrainingFields[selectedExtraCropBox].type == 'FT' && extraTrainingFields[selectedExtraCropBox].coordinates.length > 0) {
            $(".recd-" + selectedExtraCropBox).find('.cropingFT').addClass('active');
        }

        $(".displayHereImages").html('');
        $(".displayHereContent").html('');
        $(".extraTrainingDiv").hide();
    })

    $("body").on("click", ".extraTrainingDivSave", function () {
        ft_obj = {};
        $("select[id^='change_Select_']").each(function () {
            var parentElement = $('#' + this.id).parent();
            var parentElementid = parentElement[0].id;
            var parentInnerHtml = $('#' + parentElementid).html();
            var objKey = parentInnerHtml.slice(0, parentInnerHtml.indexOf('<select'));
            ft_obj[objKey] = $('#' + this.id).val();
        })

        //(ft_obj);
        areas_C = Object.assign({}, {
            'key': changedAreasCount
        })
        areasC = areas_C.key;
        arr = []
        for (var i = 0; i < areasC.length; i++) {
            obj = {}
            obj.x = newCord1(areasC[i].x)
            obj.y = newCord1(areasC[i].y)
            obj.width = newCord1(areasC[i].width)
            obj.height = newCord1(areasC[i].height)
            obj.page = areasC[i].page;
            obj.id = areasC[i].id;
            obj.z = 0;
            arr.push(obj)
        }
        arr.push(ft_obj);
        //(arr, changedAreasCount);
        extraTrainingFields[selectedExtraCropBox].coordinates = arr
        //(extraTrainingFields);
        for (var i = 0; i < imgs.length; i++) {
            width_ = $("#imgCount-" + i).width();
            $("#imgCount-" + i).selectAreas('destroy');
        }

        $(".recd-" + selectedExtraCropBox).find('.extraCrps').removeClass('active');

        if (extraTrainingFields[selectedExtraCropBox].type == '2D') {
            $(".recd-" + selectedExtraCropBox).find('.croping2d').addClass('active');
        } else if (extraTrainingFields[selectedExtraCropBox].type == 'Context') {
            $(".recd-" + selectedExtraCropBox).find('.cropingContext').addClass('active');
        } else if (extraTrainingFields[selectedExtraCropBox].type == 'FT') {
            $(".recd-" + selectedExtraCropBox).find('.cropingFT').addClass('active');
        }
        $(".displayHereImages").html('');
        $(".displayHereContent").html('');
        $(".extraTrainingDiv").hide();
    })

    function testView(width, fields) {
        obj = {}
        obj.case_id = case_id;
        obj.field_data = fields;
        obj.width = width;
        obj.force_check = 'no';
        obj.tenant_id = tenant_id
        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/testFields",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(obj)
        };
        $(".loading_full").show();
        $.ajax(settings11).done(function (msg) {
            if (msg.flag) {
                $(".loading_full").hide();

                $(".fieldsDisplayTest").html('')

                $(".testView").show();
                $.each(msg.data, function (k, v) {
                    v = v.replace(/suspicious/g, '')
                    if (v == 'NaN') {
                        v = 'Not in Invoice'
                    }
                    tst = '<div class="col-sm-6">'
                    tst += '<div class="formFieldView">'
                    tst += '<label>' + k.replace(/_/g, ' ') + '</label>'
                    tst += '<input type="text" value="' + v + '">'
                    tst += '</div>'
                    tst += '</div>'

                    $(".fieldsDisplayTest").append(tst)
                })
            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
                $(".loading_full").hide();
            } else {
                $(".loading_full").hide();
                $.alert(msg.message, 'Alert');
            }
        });
    }

    function displayTableTrainedData(tblData) {
        $(".allTableResults").append('<div class="stage2"></div><div class="stage2Btns"><button method="tnox" class="waves-effect waves-light btn-small mr-t-10 light-blue mr-r-20 mr-b-20 proceedVers removeThis" onclick="return false;">Train</button></div>')
        headerTrainedData = {}
        footerTrainedData = {}
        $.each(tblData, function (k, v) {
            if (k.toLowerCase().indexOf('v') == 0) {
                headerTrainedData[k] = v
            } else {
                footerTrainedData[k] = v
            }
        })
        optns = '<option value="">Select Alias</option>'
        //(default_Output_fields);
        for (var i = 0; i < forTable.length; i++) {
            tableField = forTable[i]
            optns += '<option value="' + tableField + '">' + tableField + '</option>'
        }

        $.each(headerTrainedData, function (k, v) {
            cc = k.split('v');
            cc_ = cc[1].split('.');
            sub = 'splits="no"'
            if (cc_.length > 1) {
                sub = 'splits="yes" sub="' + cc_[1] + '"'
            }
            cls = ''
            if (v['del'] == 'yes') {
                cls = 'disabledcol'
            }
            vv = '<div class="removeAllHeaders box ' + cls + ' box-v box-' + k + '" del="' + v['del'] + '" id="' + cc_[0] + '" ' + sub + '>'
            vv += '<div class="">'
            vv += '<p style="float: left;">' + k + '</p>'
            vv += '<input type="text" placeholder="Label" name="" value="' + v['label'] + '" class="label_inputs label_name">'
            vv += '<div class="clear__"></div>'
            vv += '</div>'
            vv += '<div class="">'
            vv += '<select class="label_inputs alias_change alias_change' + k + ' thisOpt mr-b-0">' + optns + '</select>'
            vv += '</div>'
            if (v['del'] == 'yes') {
                vv += '<image src="images/redo-solid.svg" class="delete_col repeat">'
            } else {
                vv += '<image src="images/trash.svg" class="delete_col trash">'
            }
            vv += '<div>'
            vv += '<label>'
            chk = v['ref'] ? 'checked' : ''
            vv += '<input class="with-gap" name="group1" type="radio" ' + chk + '/>'
            vv += '<span>Ref key</span>'
            vv += '</label>'
            vv += '<label class="mr-l-20">'
            chk1 = v['field'] ? 'checked' : ''
            vv += '<input type="checkbox" class="filled-in markField" ' + chk1 + '/>'
            vv += '<span>Mark as field</span>'
            vv += '</label>'
            vv += '<div class="fieldSelectDiv">'
            if (chk1) {
                field_opts = '<option value="">Select Type</option>'
                field_opts = '<option value="kh_vh">Key, Values in Header</option>'
                field_opts += '<option value="kh_vc">Key in Header, Value in Column</option>'
                vv += '<select class="label_inputs fieldOpts' + k + ' mr-b-0">' + field_opts + '</select>'
            }
            vv += '</div>'
            vv += '</div>'
            vv += '</div>'
            $(".stage2").append(vv);

            $(".alias_change" + k).val(v['alias'].replace('Table.', ''))
            if (chk1) {
                $(".fieldOpts" + k).val(v['field_type'])
            }

        })

        $.each(footerTrainedData, function (k, v) {
            i = k.toLowerCase().split('v')[1]
            vv = '<div class="removeAllHeaders box" del="no">'
            vv += '<div class="">'
            vv += '<p style="float: left;">Footer' + i + '</p>'
            vv += '<input type="text" placeholder="Label" name="" value="' + v['label'] + '" class="label_inputs label_name footerData">'
            vv += '<div class="clear__"></div>'
            vv += '</div>'
            vv += '</div>'
            $(".stage2").append(vv);
        })

        $("select").formSelect();
        //(headerTrainedData, footerTrainedData);
    }

    $("body").on("click", ".zoomIn", function () {
        if (zoom < maxZoom) {
            zoom += 20;
            if (zoom > maxZoom) {
                zoom = 250;
            }
            $(".HorZOn").css("width", zoom + '%')
        }
    })

    $("body").on("click", ".zoomOut", function () {
        if (zoom > minZoom) {
            zoom -= 20;
            if (zoom < minZoom) {
                zoom = 100;
            }
            $(".HorZOn").css("width", zoom + '%')
        }
    })

    $("body").on("click", ".zoomFit", function () {
        title = $(this).attr('title')
        if (title == 'Zoom to 200%') {
            zoom = 200;
            $(this).attr('src', 'images/fit.svg')
            $(this).attr('title', 'Fit to screen')
        } else {
            zoom = 100;
            $(this).attr('title', 'Zoom to 200%')
            $(this).attr('src', 'images/zoom.svg')
        }
        $(".HorZOn").css("width", zoom + '%')
    })

    $("body").on("keyup", ".searchFields", function () {
        val = $(this).val();
        if (nullCheck(val)) {
            fieldsBoxs = $(".fieldTrain");
            for (var i = 0; i < fieldsBoxs.length; i++) {
                fv = fieldsBoxs[i].attributes.field.value.toLowerCase();
                idx = fv.indexOf(val.toLowerCase());
                if (idx > -1) {
                    fieldsBoxs[i].style.display = "";
                } else {
                    fieldsBoxs[i].style.display = "none";
                }
            }
        } else {
            $(".fieldTrain").show();
        }
    })

    $("body").on("click", ".skipTraining", function () {
        obj = {}
        obj.case_id = case_id;
        obj.queue = 'Template Exceptions'
        obj.tenant_id = tenant_id

        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/move_to_verify",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(obj)
        };
        $(".loading_full").show();
        $.ajax(settings11).done(function (msg) {
            $(".loading_full").hide();
            if (msg.flag) {
                $(".testView").hide()
                $(".fieldsDisplayTest").html('')
                $.alert(msg.message, 'Alert');
                closePage()
            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
                $(".loading_full").hide();
            } else {
                $(".loading_full").hide();
                $.alert(msg.message, 'Alert');
            }
        });
    })

})