$(document).ready(function () {
    clicked_table_name = ''
    var table_unique_data = [{
        unique_name: "table1",
        display_name: "Add Table"
    }]
    table_output = {}
    var clickFlag = true;
    $(".notify_message").hide()

    var meta_fields = {}
     originUrl = window.location.origin.split(':');
    // dynamicUrl = originUrl[0] + ":" + originUrl[1] + ":5002";
    dynamicUrl = "http://3.110.230.254:5002"
    fieldSplits = 0;
    $(".secondary_view").hide();
    $(".autoSuggestView").hide();
    document_identifiers = [];
    var wrap_text_obj = {}
    var selectedBox = '';
    var d_i_opts = '';
    all_keywords_data = []
    var colortype
    var fieldsList = []
    var clicked_fields = {}
    var nextClicked = false;
    var footerData = {};
    var mandatoryFields = [];
    var tableCrops = {};
    var tableFinalCrops = {};
    var alt_title = 'header';
    var mainDataToSend = {};
    var img_ocr_data;
    var imagefiles_;
    var fieldHistory = {}
    var forFields = []
    var forTable = {}
    var clicked_id;
    var vendor_list = [];
    var tab_field_def = {}
    var display_name_mapping;
    var retrain_field_temp = {}
    var file_pages = {}
    var lines_data;
    timer = 0;
    var table_flag = false;
    abbyyTrainObj = {}
    trainingOngoing = false;
    showpredictedfields = false
    var file_id = decodeURIComponent(getUrlParameter('file_name'));
    var case_id = decodeURIComponent(getUrlParameter('case_id'));
    var retrain = getUrlParameter('retrain');
    var user_name = decodeURIComponent(getUrlParameter('user'));
    var template_name_retrain = decodeURIComponent(getUrlParameter('template'));
    var tenant_id = getUrlParameter('host_name')
    var new_retrain = {}

    file_id = file_id ? file_id : ''

    retrain = nullCheck(retrain) ? (retrain == 'true' ? true : false) : false

    field_changed_retrain = false;

    $(".retrained-img-view").hide()
    var retrained_image = false

    var predicted_data = [];
    var table_data_final = {}
    var field_id_map = {}
    var dpi_page;
    trained_fields = []

    var alias_data;
    var globalFooter;
    if (template_name_retrain == 'new') {
        retrain = false;
    }

    for_delete_obj = {}

    det_delete = true;
    field_areas_obj = {};
    field_flag = false;
    var dropDown_add;
    var areaCount = 1;
    var attr_field_data_obj = {}

    showBtns('')
    if (nullCheck(case_id)) {
        sendObj = {};
        var settings11 = {}
        loading(true);
        if (retrain) {
            retrain_this(template_name_retrain, true)
        } else {
            sendObj.file_name = file_id;
            sendObj.case_id = case_id;
            sendObj.retrain = retrain;
            sendObj.tenant_id = tenant_id
            if (retrain) {
                sendObj.template_name = template_name_retrain.replace(/%20/g, " ");
            }
            settings11 = {
                "async": true,
                "crossDomain": true,
                "url": dynamicUrl + "/get_ocr_data_training",
                "method": "POST",
                "processData": false,
                "contentType": "application/json",
                "data": JSON.stringify(sendObj)
            };
            // msg = response_data;
            // console.log(response_data);
            $.ajax(settings11).done(function (msg) 
		    {
			    msg = JSON.parse(msg)
                if (msg.flag) {
                    initial_shows(msg, true)
                } else if ($.type(msg) == 'string') {
                    $.alert('Something went wrong', 'Alert');
                    loading(false);
                } else {
                    loading(false);
                    $.alert(msg.message, 'Alert');
                }
            }).fail(function () {
                $.alert('Something went wrong', 'Alert');
                loading(false);
            })
        }
    }


    function initial_shows(msg, ft) {
        if(retrain){
            fieldsList = msg.fields
        }
        file_pages = msg.file_pages ? msg.file_pages : {}
        if (msg.document_identifiers.length > 0) {
            document_identifiers = msg.document_identifiers;
        } else {
            document_identifiers = [];
        }
        mandatoryFields = msg.mandatory_fields ? msg.mandatory_fields : [];
        idx = mandatoryFields.indexOf('Vendor Name');
        if (idx > -1) {
            mandatoryFields.splice(idx, 1)
        }
        idx = mandatoryFields.indexOf('Digital Signature');
        if (idx > -1) {
            mandatoryFields.splice(idx, 1)
        }
        dropDown_add = msg.drop_down_config ? msg.drop_down_config : []
        dpi_page = msg.dpi_page ? msg.dpi_page : [];
        meta_fields = msg.meta_fields ? msg.meta_fields : {};
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

        allQueues = msg.skip_templates;

        if (nullCheck(allQueues)) {
            $(".skipTemp").addClass('initialBorder');
            $(".skipTemp").html('<p>Skip Template</p> <select class="allQueues"> </select>');
            vr = '<option value="">Select Queue</option>';
            for (t = 0; t < allQueues.length; t++) {
                vr += '<option value="' + allQueues[t] + '">' + allQueues[t] + '</option>';
            }
            $(".allQueues").html(vr);
            $(".allQueues").formSelect();
        }

        // table_unique_data = msg.
        showTableRelated();

        vendor_list = msg.vendor_list ? msg.vendor_list : [];
        vendr_optns = '';
        for (var i = 0; i < vendor_list.length; i++) {
            vendr_optns += '<option value="' + vendor_list[i] + '">';
        }
        $("#templates_list").html(vendr_optns)
        img_ocr_data = msg.data;
        new_predicted_data = msg.grouped_mandatory_fields;
        // predicted_data = convertFieldstoPredicted(msg.fields, msg.predicted_fields);
        predicted_data = msg.predicted_fields;

        console.log(predicted_data);

        display_name_mapping = msg.display_name_mapping;

        forTable['table1'] = msg.fields;
        fieldHistory = {}

        allDisplayFields = []
        if (ft) {
            $(".loadmask-msg").append('<p class="loading-text" style="margin-top:40px;margin-left:60px" >Loading Image...</p>')
            // file_id = msg.file_name
            tab_field_def = msg.properties;
            groupCurrencyOpts = msg.dropdown_dict;
            var num = Math.random();

            img_width = $(".HorZOn").width();
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
                loading(true);
                $.ajax(settings11).done(function (bl) {

                    if (bl.flag) {
                        blob_data = bl.data;
                        pdftoimg(blob_data)
                    } else if ($.type(bl) == 'string') {
                        $.alert('Something went wrong', 'Alert');
                        loading(false);
                    } else {
                        loading(false);
                        $.alert(bl.message, 'Alert');
                    }
                })
            } else {
                if (file_pages && file_pages[file_id] && Object.keys(file_pages[file_id]).length > 0) {
                    file_pgs = []
                    for (let f_p = 0; f_p < file_pages[file_id].length; f_p++) {
                        file_pgs.push('images/invoices/' + tenant_id + '/' + case_id + '/images/' + file_pages[file_id][f_p] + "?v=" + num);
                    }
                    imagesArr = file_pgs
                    displayImage(file_pgs)
                }
                else {
                    loading(true);
                    file_id = msg.file_name
                    file_name = 'images/invoices/' + file_id + '?v=' + num;
                    file_name_original = file_id;
                    splited_ = file_name_original.split('.');
                    check_file = splited_[splited_.length - 1];
                    logThis(6, [file_name, check_file]);
                    if (check_file.toLowerCase() == 'pdf') {
                        logThis(8, "Its a PDF file")
                        previewPdfFile(file_name)
                    } else if (check_file.toLowerCase() == 'tiff' || check_file.toLowerCase() == 'tif') {
                        logThis(8, "Its a TIFF file")
                        previewTiffFile(file_name)
                    } else if (check_file.toLowerCase() == 'jpg' || check_file.toLowerCase() == 'jpeg' || check_file.toLowerCase() == 'png') {
                        logThis(8, "Its a Image file")
                        imagesArr = [file_name]
                        displayImage([file_name])
                    } else {
                        logThis(8, "It is not a image file")
                        $.alert('Invalid file name ' + file_name_original, 'Alert');
                    }
                }

            }
        }

        if (msg.company_id) {
            $(".company_details_training").html((msg.company_id || '') + " - " + (msg.company_name || ''))
        }
    }



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
                    loading(false);
                    $.alert("Network Error", 'Alert');
                };
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(xhr.response)
                    } else {
                        reject("Loading error:" + xhr.statusText)

                        loading(false);
                        $.alert("File Not Found", 'Alert');
                    }
                };
                xhr.send();
            } catch (err) {
                reject(err.message)
                loading(false);
                $.alert("File Not Found", 'Alert');
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
            loading(false);
            $.alert('Something went wrong', 'Error');
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
            for (var i = 0; i < tiff_count; i++) {
                tiff.setDirectory(i);
                var canvas = tiff.toCanvas();
                imagefiles.push(canvas.toDataURL())
            }
            var canvas = tiff.toCanvas();
            displayImage(imagefiles)
        };
        xhr.send();
    }

    // to display image
    function displayImage(imagefiles) {
        img__ = ''
        if (retrain && retrained_image) {
            $(".retrainImageCount").remove();
            for (var i = 0; i < imagefiles.length; i++) {
                img__ += '<img src="' + imagefiles[i] + '" class="retrainImageCount retrainImageCount' + i + '" alt="' + i + '"  width="100%">';
            }
            $(".show_img_retrains").append(img__)
            for (const k in case_fields) {
                if (case_fields[k].field === selectedBox) {
                    if (case_fields[k].coordinates.length > 0) {
                        $(".delete_retrain_fields").show();
                    }
                    $(".delete_retrain_fields").attr("case_id", selected_case_id)
                    $(".delete_retrain_fields").attr("id", k);
                    retrain_crops(case_fields[k].coordinates, case_fields[k].width);
                }
            }
            loading(false);
        }
        else {
            inital_ct = 0;
            imagefiles_ = imagefiles;
            for (var i = 0; i < imagefiles.length; i++) {
                img__ += '<img src="' + imagefiles[i] + '" id="imageCountNum' + i + '" class="imageCount imageCountNum' + i + '" alt="' + i + '"  width="100%">';
            }
            $(".HorZOn").html(img__)
            loading(false);
            $(".loading-text").remove();
            if (!retrain) {
                generate_predicted_fields()
            }
            dp_page();
        }
    }

    function generate_predicted_fields() {
        fieldHistory = {}
        if(retrain && showpredictedfields){
        for (var i = 0; i < predicted_data.length; i++) {
            forFields.push({
                name: predicted_data[i]['field'],
                value: predicted_data[i]['field']
            })
            ky_ = predicted_data[i]['field'].replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_');
            for_delete_obj[i + "-" + ky_] = false
            if (predicted_data[i]['coordinates'].length > 0) {
                for_delete_obj[i + "-" + ky_] = true
            }
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
                obj.width = wd > 9 ? (width_ > wd ? wd : 200) : 10;
                obj.height = ht > 9 ? ht : 10;
                obj.x = lf > 0 ? (lf > width_ ? 10 : lf) : 1;
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
        }
        field_areas_obj = fieldHistory
        displayFieldsMain()
        }
        else{
            for (var i = 0; i < fieldsList.length; i++) {
                forFields.push({
                    name: fieldsList[i],
                    value: fieldsList[i]
                })

                ky_ = fieldsList[i].replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_');
                for_delete_obj[i + "-" + ky_] = false
                fieldHistory[i + "-" + ky_] = []
            }

            field_areas_obj = fieldHistory
            displayFieldsMain()
        }
    }

    $("body").on("click", ".closeTempModal", function () {
        console.log(colortype)

        $(".template_name_val").val('');
        $(".template_name_modal").hide();

        if (colortype == 'field') {
            $('.fields .head').addClass('bg-blue')
        } else if (colortype == 'table') {
            $('.table .head').addClass('bg-blue')

        }

        // $('.head').addClass('bg-blue')
    })

    //to enable the crop
    function enableKeywordCrop() {
        det_delete = false;
        destroyAreasAll()
        width_ = $(".imagesCountNum0").width();
        var obj = {
            onChanged: debugKeywordAreas,
            onChanging: changingAllAreas,
            width: width_,
            allowDelete: 'delete',
            addPlus: false,
            numbering: false,
        }
        nextClicked = false
        createSelectAreas(obj)
    }


    function createSelectAreas(obj) {
        for (var i = 0; i < imagefiles_.length; i++) {
            width_ = $(".imagesCountNum" + i).width();
            $("#imageCountNum" + i).selectAreas(obj);
        }

    }
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
    changingAllAreas = function changingAllAreas(event, id, areas) {
        ii = areas.findIndex(x => x.id == id);
        word = getWord(rte(areas[ii], $("#imageCountNum0").width()))
        $(".displayCropWord").html(word)
        console.log(word)


        if (timer) {
            clearTimeout(timer);
            timer = 0;
        }

        $('.displayCropWord').fadeIn();
        timer = setTimeout(function () {
            $('.displayCropWord').fadeOut()
        }, 3000)
    }

    function getWord(params) {
        text = ''
        for (let i = 0; i < params.length; i++) {
            text += ' ' + params[i].word;
        }
        return $.trim(text)


    }

    function rte(box, w) {
        key = box['page'];
        if (img_ocr_data.length > 0 && img_ocr_data[key]) {
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
            for (var i = 0; i < img_ocr_data[key].length; i++) {
                word_t = img_ocr_data[key][i]['top']
                word_r = img_ocr_data[key][i]['left'] + img_ocr_data[key][i]['width']
                word_b = img_ocr_data[key][i]['top'] + img_ocr_data[key][i]['height']
                word_l = img_ocr_data[key][i]['left']
                if ((box_l <= word_l && word_r <= box_r) && (box_t <= word_t && word_b <= box_b)) {
                    words_in_box.push(img_ocr_data[key][i])
                }
            }
        }
        else {
            words_in_box = ''
            
            notifyMessage('OCR Data is not available!', 'warning')
        }
        return words_in_box;
    }
    
    function notifyMessage(msg, type) {
        $(".notify_message").show()
        var icon = ''
        if (type === 'success') {
            icon = 'check_circle'
        }
        else if (type === 'info') {
            icon = 'info'
        }
        else if (type === 'warning') {
            icon = 'warning'
        }
        else if (type === 'error') {
            icon = 'error'
        }
        
        a = '<div class="tn-box tn-box-color-' + type + ' tn-box-active">'
            a += '<p>' + msg + '</p>'
            a += '<div class="tn-progress"></div>'
        a += '</div>'
        $(".notify_message").html(a)
        setTimeout(() => {
            $(".notify_message").hide()
        }, 8000);
    }

    function displayKeyWords(words, ar) {
        text = ''
        for (let j = 0; j < words.length; j++) {
            text += ' ' + words[j].word;
        }
        var temp_obj = Object.assign({}, ar)
        temp_obj.word = $.trim(text)
        all_keywords_data.push(temp_obj)
        $(".keywords_display").append('<div class="sub_keywords_display" value="' + $.trim(text) + '">' + $.trim(text) + '</div>');
    }

    function displayFieldsMain() {
        $('.display_units').html('');
        showFieldTrain = true;
        alt_title = 'field'
        nextClicked = false;

        var count = 0;
        // var crop_cod
        if(retrain && showpredictedfields){

            fields_p = predicted_data
            $(".group_main").html('')

            for (var i = 0; i < fields_p.length; i++) {
                field_id_map[fields_p[i]["field"].replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')] = i;
                count = count + 1;
                predicted_obj = fields_p[i];
                class_name = 'group_main';
                pg = predicted_obj.coordinates.length > 0 ? predicted_obj.coordinates[0].page : 0
                try {
                    val = predicted_obj.coordinates[0].word;
                } catch (error) {
                    val = ''
                }
                addFields(i, 0, fields_p[i].field, class_name, count, predicted_obj, fields_p[i].field, val)
    
            }
            // $("select").formSelect();
            $(".allFieldResults").removeClass('hidden')
        }
        else{

            // var crop_cod
            $(".group_main").html('')

            for (var i = 0; i < fieldsList.length; i++) {
                field_id_map[fieldsList[i].replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')] = i;
                count = count + 1;
                class_name = 'group_main';
                predicted_obj = predicted_data.find(x => x.field == fieldsList[i]) || {};
                try {
                    val = predicted_obj.coordinates[0].word;
                } catch (error) {
                    val = ''
                }
                addFields(i, 0, fieldsList[i], class_name, count, predicted_obj, fieldsList[i], val)

            }
            // $("select").formSelect();
            $(".allFieldResults").removeClass('hidden')
        }

    }

    function addFields(id, target, field_name, class_name_field, count, predicted_obj, kywd_, value) {
        kywd = kywd_.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
        filter_value = kywd.replace(/_/g, ' ');
        kp = ''
        if (trained_fields.indexOf(field_name) > -1) {
            kp += '<img src="images/check.png" class="keyword_check_img">'
        } else {
            value = ''
        }

        tr = '<div class="fieldTrain pos_rl  recd-' + id + '-' + kywd + '" id="' + id + '" field_type="static" filter="' + filter_value + '"  value="" field="' + field_name + '" split="no" target="' + kywd + '" c="' + count + '"  ty="new">'
        tr += '<div class="fieldValid-' + id + '-' + kywd + '">'
        var str = predicted_obj.display_name ? predicted_obj.display_name : field_name
        var res = str.substring(0, 15);
        tr += '<span class="retrain_count retrain_count-' + kywd + '"></span>'
        tr += '<p first="yes" group="' + kywd + '" class="mods_inputs keywordSelect keyword-' + id + '-' + kywd + ' pointer" title="' + str + '" field="' + field_name + '">' + res.replace(/_/g, ' ') + '</p>'
        tr += kp
        tr += '</div>'
        tr += '</div>'
        $("." + class_name_field).append(tr);
    }

    var updated_crops = undefined
    $('body').on('click', '.keywordSelect', function () {
        if (!clickFlag) {
            $('.testBtn').hide();
            $('.nextToDi').hide()
            $('.testConfirmBtn').show();
            $('.closeTestView').show();
            $('.textConfirm').addClass('moveTop')
        } else {
            $(".mapping_imags_here").html('');
            $(".image-box-view").show()
            $(".details-view").show()
            $('.mapping-view').hide()
            $('.footer_trace').hide()
            $('.testBtn').show();
            $('.nextToDi').show()
            $('.testConfirmBtn').hide();
            $('.closeTestView').hide();
            $('.textConfirm').removeClass('moveTop')
        }
        updated_crops = undefined

        det_delete = false
        nofiles = $('.imageCount').length;
        for (var i = 0; i < nofiles; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
        }
        clicked_id = $(this).closest(".fieldTrain").attr("id");
        selectedBox = $(this).attr('group');

        $(".units").hide()
        $(".unit-" + selectedBox).show();

        field = $(this).closest(".fieldTrain").attr("field");
        boxClick(clicked_id);

        if (field_areas_obj[clicked_id + '-' + selectedBox].length > 0) {
            if (!retrain) {
                clicked_fields[clicked_id + '-' + selectedBox] = true
            }
            pageNum = field_areas_obj[clicked_id + '-' + selectedBox][0]
            page_height = pageNum.top;
            for (let i = 0; i < pageNum.page; i++) {
                page_height += $("#imageCountNum" + i).height();
            }
            var imageBody = $(".showImgs");
            imageBody.stop().animate({
                scrollTop: page_height
            }, 500);
        }
        wrap_text_obj[clicked_id + '-' + selectedBox] = wrap_text_obj[clicked_id + '-' + selectedBox] ? wrap_text_obj[clicked_id + '-' + selectedBox] : {}
        wrap_text_obj.removed_cases = wrap_text_obj.removed_cases ? wrap_text_obj.removed_cases : {}
        displayFields(field_areas_obj[clicked_id + '-' + selectedBox]);

        setTimeout(function () {
            det_delete = false
            startAreas();
        }, 500);

        $(".image_box_re").removeClass('activate')
        $(".retrain_templates").removeClass('open')

        retrain_field_temp[selectedBox] = retrain_field_temp[selectedBox] ? retrain_field_temp[selectedBox] : []

        if (retrain && retrain_field_temp[selectedBox].length > 0) {
            highlight_cases(retrain_field_temp[selectedBox])
        }
    })

    function boxClick(id) {
        if (!$(".recd-" + id + "-" + selectedBox).hasClass('selected')) {
            $(".fieldTrain").removeClass('selected').addClass('op-p5')
            $(".recd-" + id + "-" + selectedBox).addClass('selected').removeClass('op-p5')
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
            clicked_fields[clicked_id + '-' + selectedBox] = true
            field_areas_obj[clicked_id + "-" + selectedBox] = areas;
            for (let i = 0; i < areas.length; i++) {
                word = getWord(rte(areas[i], $("#imageCountNum0").width()))
                areas[i].word = word
                field_changed_retrain = true
                if (i == 0) {
                    $(".recd-" + clicked_id + "-" + selectedBox).attr('value', word)
                }
            }
            displayFields(areas)
            addLines(areas)
        }
    }


    timer = 0;
    changingAreas = function changingAreas(event, id, areas) {

        if (alt_title == 'field') {
            $('.testBtn').show();
            $('.nextToDi').show();
            $('.training-layout').removeClass('doc_iden_training')
            $('.btns_for_test').hide();
            $('.btns_for_fields').show();
        }
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

    function displayFieldUnit(kywd_) {
        // UNITS VIEW
        field_name = kywd_;

        field_unique_name = kywd_.replace(/[ |\/|\(|\|\=|\.|\,)]/g, '_');
        field_unique_name = field_unique_name.replace(/</g, 'lt');
        field_unique_name = field_unique_name.replace(/>/g, 'gt');
        var tr = ''
        if (tab_field_def[kywd_]) {
            tr += '<div class="units unit-' + field_unique_name + '">'
            tr += '<div class="unitOpts">'
            for (let t = 0; t < tab_field_def[kywd_].length; t++) {
                unit_obj = tab_field_def[kywd_][t];
                tr += '<div>'
                // tr += '<span class="label_">' + unit_obj.display_name + '</span>'
                if (unit_obj.type == 'dropdown') {
                    u_uq_name = unit_obj.unique_name.replace(/[ |\/|\(|\|\=|\.|\,)]/g, '_')
                    u_uq_name = u_uq_name.replace(/</g, 'lt');
                    u_uq_name = u_uq_name.replace(/>/g, 'gt');

                    tr += '<select field="' + field_name + '" unique_name="' + unit_obj.unique_name + '" class="unitSelect unitSelect-' + u_uq_name + '" key="' + kywd_ + '">'
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
        $('.display_units').append(tr)

        $(".units").hide();
    }

    function displayFields(selectedFieldCoordinates) {
        percents = [100, 95, 90, 85, 80, 75, 70, 60]
        $('.field_val_display').html('');
        $(".options_view").hide()
        if (selectedFieldCoordinates.length > 0) {
            len = $(".fieldValid-" + clicked_id + "-" + selectedBox).find(".keyword_check_img").length;
            if (len == 0) {
                $(".fieldValid-" + clicked_id + "-" + selectedBox).append('<img src="images/check.png" class="keyword_check_img">')
            }
            // $('.field_val_display').append()

            wrap_text_obj[clicked_id + "-" + selectedBox]['threshold_values'] = wrap_text_obj[clicked_id + "-" + selectedBox]['threshold_values'] || {}
            for (let i = 0; i < selectedFieldCoordinates.length; i++) {
                var bg_color = 'keyword';
                if (i == 0) {
                    bg_color = 'value';
                }
                word = getWord(rte(selectedFieldCoordinates[i], $("#imageCountNum0").width()))
                selectedFieldCoordinates[i].word = word
                if (i == 0) {
                    $(".recd-" + clicked_id + "-" + selectedBox).attr('value', word)
                }
                select_opt = ''
                for (pi = 0; pi < percents.length; pi++) {
                    selected = ''
                    if (wrap_text_obj[clicked_id + "-" + selectedBox]['threshold_values'].length == 0 && selectedFieldCoordinates[i] && percents[pi] === selectedFieldCoordinates[i].threshold) {
                        selected = 'selected'
                    }
                    else if (wrap_text_obj[clicked_id + "-" + selectedBox]['threshold_values'][i] == percents[pi]) {
                        selected = 'selected'
                    }
                    select_opt += '<option value="' + percents[pi] + '" ' + selected + '>' + percents[pi] + '%</option>';
                }
                $('.field_val_display').append('<div class="sub_keywords_display_field pointer  ' + bg_color + '" title="' + bg_color.toUpperCase() + '"><span data-length="' + i + '" class="attributesView">' + word + '</span> <span><select class="fields_select field_threshold field_threshold-' + clicked_id + '-' + selectedBox + '-' + i + '  ' + bg_color + '" len="' + i + '">' + select_opt + '</select></span></div>')


                wrap_text_obj[clicked_id + "-" + selectedBox]['threshold_values'][i] = selectedFieldCoordinates[i].threshold ? selectedFieldCoordinates[i].threshold : 100;
            }
            // $('.field_val_display').append('')
            if ($(".more_options_screen .options-" + clicked_id + "-" + selectedBox).length == 0) {
                wrap_text_obj[clicked_id + '-' + selectedBox].wrap_text = false;
                wrap_text_obj[clicked_id + '-' + selectedBox].multiple_values = false;
                wrap_text_obj[clicked_id + '-' + selectedBox].false_positive = true;
                wrap_text_obj[clicked_id + '-' + selectedBox].false_negative = false;
                $(".more_options_screen").append("<div class='options_view options-" + clicked_id + "-" + selectedBox + "'></div>")

                op = '<p class="options_headers">Options for <b>' + selectedBox + '</b></p>'
                op += '<div class="scroll_y b">'
                op += '<div class="mr-b-10 br"><label class="checkbox"><input type="checkbox" class="checkbox__input textWrap multiLine-' + clicked_id + '-' + selectedBox + '" val="' + selectedBox + '"/><span class="checkbox__checkmark"></span> Text Wrap</label></div>'
                op += '<div class="mr-b-10 br"><label class="checkbox"><input type="checkbox" class="checkbox__input multiKeywordCheck multiKeywordCheck-' + clicked_id + '-' + selectedBox + '" /><span class="checkbox__checkmark"></span> Multiple</label></div>'
                op += '<div class="mr-b-10 br" style="padding: 0px 0px 10px 0px;"><button class="show_map button" field="' + selectedBox + '">Show Trace</button></div>'
                op += '<div class="mr-b-10 br">'
                op += '<label class="ref">'
                chk = 'checked'
                op += '<input class="with-gap flase_check" value="false_positive" name="false_positive' + clicked_id + '-' + selectedBox + '" type="radio" checked/>'
                op += '<span>False Positive</span>'
                op += '</label><br>'
                op += '<label class="ref">'
                op += '<input class="with-gap flase_check" value="flase_negative" name="false_positive' + clicked_id + '-' + selectedBox + '" type="radio" />'
                op += '<span>False Negative</span>'
                op += '</label>'
                op += '</div>'
                op += '</div>'
                $(".more_options_screen .options-" + clicked_id + "-" + selectedBox).html(op)
            }
            else {
                $(".more_options_screen .options-" + clicked_id + "-" + selectedBox).show()
            }
        }
        if (selectedFieldCoordinates.length == 0) {
            $(".recd-" + clicked_id + "-" + selectedBox).attr('value', '')
            $('.field_val_display').html('<p>Please crop the value</p>');
            $(".fieldValid-" + clicked_id + "-" + selectedBox).find(".keyword_check_img").remove()
        }
        if (selectedFieldCoordinates.length == 1) {
            $('.field_val_display').append('<p>Please crop the Key</p>');

        }
    }

    $("body").on("change", ".field_threshold", function () {
        len = $(this).attr('len');
        threshold_values_obj = wrap_text_obj[clicked_id + '-' + selectedBox].threshold_values ? wrap_text_obj[clicked_id + '-' + selectedBox].threshold_values : {}
        threshold_values_obj[len] = Number($(this).val());
        wrap_text_obj[clicked_id + '-' + selectedBox].threshold_values = threshold_values_obj;
        clicked_fields[clicked_id + '-' + selectedBox] = true


    })

    $("body").on("change", ".flase_check", function () {
        value = $("input[name='false_positive" + clicked_id + '-' + selectedBox + "']:checked").val()
        wrap_text_obj[clicked_id + '-' + selectedBox].false_positive = value == 'false_positive' ? true : false;
        wrap_text_obj[clicked_id + '-' + selectedBox].false_negative = value == 'false_negative' ? true : false;
        clicked_fields[clicked_id + '-' + selectedBox] = true
    })

    $("body").on("change", ".textWrap", function () {
        wrap_text_obj[clicked_id + '-' + selectedBox].wrap_text = $(this).is(":checked");
        clicked_fields[clicked_id + '-' + selectedBox] = true
    })
    $("body").on("change", ".multiKeywordCheck", function () {
        wrap_text_obj[clicked_id + '-' + selectedBox].multiple_values = $(this).is(":checked");
        clicked_fields[clicked_id + '-' + selectedBox] = true
    })
    

    $("body").on("click", ".cancelCrop", function () {
        $(".alert-delete").remove()
    });

    $("body").on("click", ".acceptDelCrop", function () {
        index = Number($(this).attr('id'))
        field_areas_obj[clicked_id + '-' + selectedBox] = []
        wrap_text_obj[clicked_id + '-' + selectedBox].threshold_values = {}
        for_delete_obj[clicked_id + "-" + selectedBox] = false

        $(".alert-delete").remove()
        delete_area_crop(index)
    })

    $('body').on('click', '.delete-area', function () {
        off_set = $(this).offset();
        $(".alert-delete").remove()
        ix = $(this).attr('id')
        if (for_delete_obj[clicked_id + "-" + selectedBox]) {
            $('body').append('<div class="alert-delete" style="top: ' + off_set.top + 'px; left: ' + (off_set.left - 240) + 'px"><p>Are you sure want to remove crops ?</p><div class="text-right"><button class="cancelCrop">Cancel</button><button class="acceptDelCrop mr-l-10" id="' + ix + '">Okay</button></div></div>')
        } else {
            index = Number(ix)
            delete_area_crop(index)
        }

    })

    function delete_area_crop(index) {
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
            field_areas_obj[clicked_id + '-' + selectedBox].splice(newDelList[i], 1)
            newCoordinates = field_areas_obj[clicked_id + '-' + selectedBox];
        }
        displayFields(newCoordinates);
        startAreas();
        if (parent_id != undefined) {
            updateAreas(parent_id);
        }
        destroyAreas();
    }

    function updateAreas(parent_id) {
        var newChild = []
        for (let n_i = 0; n_i < field_areas_obj[clicked_id + '-' + selectedBox].length; n_i++) {
            if (field_areas_obj[clicked_id + '-' + selectedBox][n_i].parent == parent_id) {
                newChild.push(n_i++)
            }
        }
        field_areas_obj[clicked_id + '-' + selectedBox][parent_id].child = newChild
        displayFields(field_areas_obj[clicked_id + '-' + selectedBox])
    }

    function destroyAreas() {
        det_delete = false;
        for (var i = 0; i < imagefiles_.length; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
        }
        det_delete = true;
        startAreas()
    }

    function destroyAreasAll() {
        det_delete = false;
        nextClicked = true;
        noFiles = $(".imageCount").length;
        for (var i = 0; i < noFiles.length; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
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

    function hasChild(parent_index) {
        try {
            return field_areas_obj[clicked_id + '-' + selectedBox][parent_index]["child"].length > 0
        } catch (error) {
            return false
        }
    }

    function get_children(parent_index) {
        try {
            return field_areas_obj[clicked_id + '-' + selectedBox][parent_index]["child"]
        } catch (error) {
            return []
        }
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

    // to add Document document identifiers

    $("body").on("click", ".addDi", function () {
        $(".all_dis").append('<select class="di_select">' + d_i_opts + '</select>');
    })

    // menu clicks
    $('body').on('click', '.nextToDi', function () {
        det_delete = false;
        nextClicked = true;
        noFiles = $(".imageCount").length;
        for (var i = 0; i < noFiles.length; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
        }
        showBtns('di')
        nextClicked = true;
        nofiles = $('.imageCount').length;
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
        mainDataToSend.keywords = all_keywords_data
        // showBtns('field_test')

    })
    $('body').on('click', '.testConfirmBtn', function () {
        det_delete = false;
        nextClicked = true;
        noFiles = $(".imageCount").length;
        for (var i = 0; i < noFiles.length; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
        }
        showBtns('di')
        nextClicked = true;
        nofiles = $('.imageCount').length;
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
        mainDataToSend.keywords = all_keywords_data
        // showBtns('field_test')

    })

    $('body').on('click', '.nextToFields', function () {
        showBtns('field')
    })
    $('body').on('click', '.nextToKeywords', function () {
        showBtns('keyword')
    })
    $("body").on("click", ".nextToTable", function () {
        showBtns('table')

        nofiles = $('.imageCount').length;
        nextClicked = true;
        for (var i = 0; i < nofiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
    })


    function showTableRelated() {
        t = '';
        s = ''
        for (let i = 0; i < table_unique_data.length; i++) {

            t += '<p class="table_name" unique_name="' + table_unique_data[i].unique_name + '">' + table_unique_data[i].display_name + ' <span unique_name="' + table_unique_data[i].unique_name + '">Add</span></p>'

            s += '<div class="tableDisplay ' + table_unique_data[i].unique_name + '">'
            s += '</div>'
        }

        $(".allTables").html(t)
        $(".forTableScroll").html(s)
    }

    $("body").on("click", ".testBtn", function () {
        $('.textConfirm').removeClass('moveTop')
        mainArr = [];
        customMainArr = [];
        dynamicMainArr = []
        totalboxess = $(".fieldTrain").length;

        outputTabFields = {}

        notFoundUnits = []
        empt___ = 0
        // $(this).hide();
        $('.testConfirmBtn').show()
        $('.closeTestView').show()

        for (var ii = 0; ii < totalboxess; ii++) {
            id = $(".fieldTrain")[ii].attributes['id'].value;
            target = $(".fieldTrain")[ii].attributes['target'].value;
            box_id = id + "-" + target;
            width_ = $('#imageCountNum0').width();
            if ($(".fieldValid-" + box_id).find(".keyword_check_img").length > 0 && clicked_fields[box_id]) {
                mainObj = {};
                mainObj.field = $(".fieldTrain")[ii].attributes['field'].value;
                mainObj.value = $(".fieldTrain")[ii].attributes['value'].value;
                for (let b_i = 0; b_i < field_areas_obj[box_id].length; b_i++) {
                    if (attr_field_data_obj[box_id] && attr_field_data_obj[box_id][b_i]) {
                        field_areas_obj[box_id][b_i].attributes = attr_field_data_obj[box_id][b_i]
                    }
                    field_areas_obj[box_id][b_i].matching_threshold = wrap_text_obj[box_id]['threshold_values'][b_i]
                }
                mainObj.coordinates = field_areas_obj[box_id] || [];
                mainObj.width = width_;
                mainObj.wrap_text = wrap_text_obj[box_id].wrap_text
                mainObj.multiple_values = wrap_text_obj[box_id].multiple_values
                mainObj.false_negative = wrap_text_obj[box_id].false_negative
                mainObj.false_positive = wrap_text_obj[box_id].false_positive
                
                mainObj.page = field_areas_obj[box_id].length > 0 ? field_areas_obj[box_id][0].page : -1;
                if ($(".fieldTrain")[ii].attributes['field_type'].value === "custom") {
                    customMainArr.push(mainObj)
                }
                else if ($(".fieldTrain")[ii].attributes['field_type'].value === "dynamic") {
                    dynamicMainArr.push(mainObj)
                }
                else {
                    mainArr.push(mainObj);
                }
            }
        }

        for (const key in tab_field_def) {
            if (tab_field_def[key].length > 0) {
                for (let i = 0; i < tab_field_def[key].length; i++) {
                    cls = tab_field_def[key][i].unique_name.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
                    if ($(".unitSelect-" + cls).length > 0) {
                        outputTabFields[tab_field_def[key][i].unique_name] = $(".unitSelect-" + cls).val();
                        field_name_alert = $(".unitSelect-" + cls).attr('field')
                        if (tab_field_def[key][i].mandatory && !nullCheck($(".unitSelect-" + cls).val())) {
                            notFoundUnits.push(field_name_alert + ' - ' + tab_field_def[key][i].display_name);
                            empt___ = 2;
                        }
                    }
                }
            }
        }
        mainDataToSend.units = Object.assign({}, outputTabFields);

        if (empt___ == 0) {
            if (nullCheck("value") || retrain) {
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
                mainDataToSend.custom_fields = Object.assign({}, customMainArr)
                mainDataToSend.dynamic_fields = Object.assign({}, dynamicMainArr)

                // Custom Fields Rules

                len = $(".cfr_group").length
                cfr_main_arr = []
                cfr_error = 0
                cfr_error_msg = ''
                for (i = 0; i < len; i++) {
                    field_check = 0
                    brackets_check = 0
                    cn = $(".cfr_group")[i].attributes.len.value
                    j_len = $(".cfr_group_" + cn).find('.cfr_box').length
                    rule = ''
                    identifiers = []
                    template_di = []
                    for (j = 0; j < j_len; j++) {
                        value = ''
                        _type = $(".cfr_group_" + cn + " .cfr_box")[j].attributes.type.value
                        threshold = ''
                        text_value = ''

                        template_obj = {}
                        if (_type == 'ocr') {
                            value = $(".cfr_group_" + cn + " .cfr_box")[j].children[1].value
                            threshold = $(".cfr_group_" + cn + " .cfr_box")[j].children[2].value;
                            text_value = $(".cfr_group_" + cn + " .cfr_box")[j].children[3].value;
                            field_check += 1
                            if (!value) {
                                cfr_error = 1
                                cfr_error_msg = _type + ' value is missing'
                            }
                        }
                        if (_type == 'custom') {
                            value = $(".cfr_group_" + cn + " .cfr_box")[j].children[1].value
                            threshold = $(".cfr_group_" + cn + " .cfr_box")[j].children[2].value;
                            text_value = $(".cfr_group_" + cn + " .cfr_box")[j].children[3].value;
                            field_check += 1
                            if (!text_value) {
                                cfr_error = 1
                                cfr_error_msg = _type + ' value is missing'
                            }
                        }
                        if (value && value != '(' && value != ')' && _type != 'custom' && _type != 'ocr' && _type != 'opertor' && _type != 'equals') {
                            field_check -= 1
                        }

                        if (_type == '(' || _type == ')') {
                            template_obj.type = _type
                            value = _type
                        }

                        if (_type == 'operator' || _type == 'equals') {
                            template_obj.type = _type
                            value = $(".cfr_group_" + cn + " .cfr_box")[j].children[1].value
                            template_obj.condition = value
                        }

                        rule += ' ' + value
                        if (_type != 'operator' && _type != 'equals' && _type != '(' && _type != ')') {
                            o = {}
                            o.text = text_value
                            o.type = _type
                            o.field = value
                            o.threshold = threshold
                            identifiers.push(o)

                            template_obj.type = _type
                            template_obj.field = value
                            template_obj.threshold = threshold
                            template_obj.text_value = text_value
                        }
                        template_di.push(template_obj)
                    }

                    if (d_i_validator(template_di)) {
                        cfr_obj = {}
                        cfr_obj.execution_rule = $.trim(rule)
                        cfr_obj.identifiers = identifiers
                        cfr_main_obj = {}
                        cfr_main_obj.priority = i + 1
                        cfr_main_obj.rule = cfr_obj
                        cfr_main_obj.template = template_di
                        cfr_main_arr.push(cfr_main_obj)
                        if (cfr_error == 0 && field_check != 1) {
                            cfr_error = 1
                            cfr_error_msg = 'Conditions between fields are missing'
                        }
                    } else {
                        cfr_error = 1
                        cfr_error_msg = 'Incorrect Brackets'
                    }
                }

                mainDataToSend.custom_fields_rules = cfr_main_arr

                if (mand_check == 1) {
                    $.confirm({
                        title: 'Alert',
                        content: "Please crop " + notFoundFields.join(', ').replace(/_/g, ' ') + " fields",
                        buttons: {
                            skip: function () {
                                testView($('#imageCountNum0').width(), mainDataToSend.fields)
                            },
                            cancel: function () { }
                        }
                    })
                } else {
                    testView($('#imageCountNum0').width(), mainDataToSend.fields)
                }
            } else { }

        } else if (empt___ == 2) {
            notFoundUnits = $.unique(notFoundUnits);
            $.alert("Please select " + notFoundUnits.join(', '), 'Alert');
        }
    })

    function testView(width, fields) {
        obj = {}
        obj.case_id = case_id;
        obj.field_data = fields;
        obj.file_name = file_id;
        obj.width = width;
        obj.force_check = 'no';
        obj.tenant_id = tenant_id
        obj.units = mainDataToSend.units
        if (retrain) {
            obj.removed_cases = wrap_text_obj.removed_cases;
        }

        var settings11 = {
            "async": true,
            "crossDomain": true,
            "url": dynamicUrl + "/testFields",
            "method": "POST",
            "processData": false,
            "contentType": "application/json",
            "data": JSON.stringify(obj)
        };
        loading(true);

        $.ajax(settings11).done(function (msg) {
            msg = JSON.parse(msg)
            loading(false);

            console.log(msg)
            if ($.isEmptyObject(msg.data)) {
                $.alert('Test Data is empty', 'Alert');
            } else {
                if (msg.flag) {
                    $('.testBtn').hide();
                    fields_p = msg.data.predicted_fields;
                    if (fields_p.length == 0) {
                        $(".field_test_results").append('<p>Test fields are empty</p>')
                    }
                    data_fields = msg.data
                    var count = 0;
                    showBtns('field_test')
                    for (var i = 0; i < fields_p.length; i++) {
                        count = count + 1;
                        fields_p[i]["id"] = field_id_map[fields_p[i]["field"].replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')]

                        try {
                            idx = display_name_mapping.findIndex(x => x.unique_name == fields_p[i]['field']);
                            fields_p[i].display_name = display_name_mapping[idx].display_name;
                        } catch (error) {
                            fields_p[i].display_name = fields_p[i]["field"];
                        }
                        console.log(fields_p[i]);

                        class_name = 'group_main';
                        textFields(i, fields_p[i]);
                    }
                } else if ($.type(msg) == 'string') {
                    $.alert('Something went wrong', 'Alert');
                    loading(false);
                } else {
                    loading(false);
                    $.alert(msg.message, 'Alert');
                }
            }
        }).fail(function () {
            $.alert('Something went wrong', 'Alert');
            loading(false);
        });
    }

    function textFields(i, predicted_obj) {
        var v = predicted_obj.value;
        var k = predicted_obj.field
        var id = predicted_obj.id
        var disp_name = predicted_obj.display_name || predicted_obj.field
        v = v.replace(/suspicious/g, '')
        if (v == 'NaN') {
            v = 'Not in Invoice'
        }
        tst = '<div class="col-sm-6">'
        tst += '<div class="formFieldView">'
        tst += '<label>' + disp_name + '</label>'
        tst += '<input type="text" group="' + k + '" value="' + v + '" field_="' + v + '" class="textSelect" id ="' + id + '">'
        tst += '</div>'
        tst += '</div>'

        $(".field_test_results").append(tst)
    }
    $("body").on("click", ".textSelect", function () {
        clickFlag = false;
        det_delete = false
        nofiles = $('.imageCount').length;
        for (var i = 0; i < nofiles.length; i++) {
            $("#imageCountNum" + i).selectAreas('destroy');
        }
        clicked_id = $(this).attr("id");
        selectedBox = $(this).attr('group');
        field_flag = true
        $(".keyword-" + clicked_id + "-" + selectedBox).click()
    })

    $("body").on("click", ".table_name span", function () {
        clicked_table_name = uq_name_class = $(this).attr('unique_name');
        alt_title = 'table'
        if (!($(this).closest(".table_name").hasClass('active'))) {
            $('.tableDisplay').hide();
            $('.tableDisplay' + '.' + clicked_table_name).show();
            $(".table_name").removeClass('active');
            $(this).closest(".table_name").addClass('active')
            if (trainingOngoing == true) {
                // $.confirm({
                //     title: 'Confirm',
                //     content: 'Please save the previous data',
                //     buttons: {
                //         ok: function () {
                //             // saveFunc(template_name)
                //         },
                //         cancel: function () {}
                //     }
                // })

            } else {
                $(".table_name").addClass('op-p5')
                $(this).parent().removeClass('op-p5')
                t = '<div>'
                t += '<p class="mr-t-10">Please crop the table</p>'
                t += '<div class="intialTableConfirm-' + uq_name_class + ' mr-t-10"></div>'
                t += '<div class="allTablesShow-' + uq_name_class + ' mr-t-20" style="overflow-x: auto;"></div>'
                t += '<div class="anyBtns-' + uq_name_class + ' mr-t-20"></div>'
                t += '</div>'
                t += '<div class="allTableResults allTableResults-' + uq_name_class + '">'
                t += '</div>'

                nextClicked = true;
                nofiles = $(".imageCount").length

                for (var i = 0; i < nofiles; i++) {
                    $('#imageCountNum' + i).selectAreas('destroy');
                }
                alt_title = 'table'
                $(".header_crop").remove();
                $(".btns_for_table ." + uq_name_class).html(t)
                showBtns('table')
                setTimeout(() => {
                    nextClicked = false

                    for (var i = 0; i < nofiles; i++) {
                        width_ = $(".imagesCountNum" + i).width();
                        $("#imageCountNum" + i).selectAreas({
                            onChanged: debugHeaderAreas,
                            width: width_,
                            maxAreas: 1
                        });
                    }

                }, 500);

            }
        }
    })


    debugHeaderAreas = function debugHeaderAreas(event, id, areas) {
        target = event.target.alt;
        nofiles = $(".imageCount").length;
        a = 0;
        click_crop_area = areas;
        if (!nextClicked) {
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
            tbl = '<button class="tryTable"  onclick="return false;" val="' + clicked_table_name + '">Proceed</button>'
            trainingOngoing = true;
            $(".intialTableConfirm-" + clicked_table_name).html(tbl)
        }
    }

    $("body").on("click", ".tryTable", function () {
        var viewTableName = $(this).attr('val')
        table_flag = true;
        $('.allTables').html('<p class="table_name active" unique_name="' + viewTableName + '">' + viewTableName + '<span unique_name="' + viewTableName + '">View</span></p>')
        $(".training-layout").addClass('tableTraining')
        $(".tryTable").parent().html('<button class="tryLines" onclick="return false;">Proceed</button><button class="tryRetry" onclick="return false;">Retry</button>')

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
        i__ = 0;
        var ftchTxt = setInterval(function () {
            if (i__ == 0) {
                i__ = 1;
                txt = '.'
            } else if (i__ == 1) {
                i__ = 2;
                txt = '..'
            } else {
                i__ = 0;
                txt = '...'
            }
            $(".loadmask-msg").append('<p class="loading-text">Fetching Table' + txt + '</p>')
        }, 1000);

        loading(true)
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
	    resp = JSON.parse(resp)
            $(".loading-text").remove()
            loading(false);
            clearInterval(ftchTxt)
            if (resp.flag) {
                table_data = resp.data.table[0][0];
                trainedTable = table_data
                table_output[clicked_table_name] = table_data
                lines_data = resp.data.table[0][1]['lines'];
                alias_data = resp.data.table[0][1]['alias'];
                // footerData[clicked_table_name] = $('.footerClass input').val();
                footerData[clicked_table_name] = resp.data.table[0][1]['footer']
                globalFooter = resp.data.table[0][1]['footer']['word']
                showTable(table_data, alias_data, globalFooter)
                showLines(lines_data)
            } else if (!resp.flag) {
                loading(false);
                $.alert(resp.message, 'Alert');
            } else {
                $.alert('Something went wrong', 'Alert');
                loading(false);
            }
        }).fail(function () {
            $.alert('Something went wrong', 'Alert');
            loading(false);
        });
    })

    $("body").on("click", ".tryRetry", function () {
        $('.footerClass-' + clicked_table_name + ' input').val('');
        $(".header_crop").remove();
        nextClicked = false
        alt_title = 'table';
        table_train = true
        nofiles = $('.imageCount').length;
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
        $(".tryLines").parent().html('<button class="tryLines" onclick="return false;">Proceed</button><button class="tryRetry" onclick="return false;">Retry</button>')
        $(".tryLines").hide();

        hor_lines = $(".horizontal_line");
        hors = []
        for (var i = 0; i < hor_lines.length; i++) {
            obj = {};
            obj.page = hor_lines[i].attributes.page.value;

            tp = adjtop(hor_lines[i].attributes.page.value)

            obj.x = Number(hor_lines[i].style.left.replace('px', ''));
            obj.y = Number(hor_lines[i].style.top.replace('px', '')) - tp;
            obj.width = Number(hor_lines[i].style.width.replace('px', ''));
            obj.height = Number(hor_lines[i].style.height.replace('px', ''));
            obj.color = hor_lines[i].attributes.color.value;
            hors.push(obj)
        }

        ver_lines = $(".vertical_line");
        vers = [];
        for (var i = 0; i < ver_lines.length; i++) {
            obj = {};

            tp = adjtop(ver_lines[i].attributes.page.value)

            obj.x = Number(ver_lines[i].style.left.replace('px', ''));
            obj.y = Number(ver_lines[i].style.top.replace('px', '')) - tp;
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
		resp  = JSON.parse(resp)
            if (resp.flag) {
                table_data = resp.data.table[0][0];

                footerData[clicked_table_name] = resp.data.table[0][1]['footer']
                globalFooter = resp.data.table[0][1]['footer']['word']
                table_output[clicked_table_name] = table_data
                showTable(table_data, alias_data, globalFooter)
            } else if (!resp.flag) {
                loading(false);
                $.alert(resp.message, 'Alert');
            } else {
                $.alert('Something went wrong', 'Alert');
                loading(false);
            }
        }).fail(function () {
            $.alert('Something went wrong', 'Alert');
            loading(false);
        });
    })

    function showTable(tbl, alias, globalFooter) {
        table_ = tbl;

        tr = '<div class="scroll_this" style="overflow-x: auto !important"><table class="table">'
        for (var i = 0; i < table_.length; i++) {
            tr += '<tr>'
            for (var j = 0; j < table_[i].length; j++) {
                if (i == 0) {
                    opts = ''
                    for (var k = 0; k < alias.length; k++) {
                        // sel = ''
                        // if (forTable[clicked_table_name][k] == alias[j]) {
                        //     sel = 'selected';
                        // }
                        opts += '<option value="' + alias[k] + '">' + alias[k] + '</option>'
                    }
                    tr += '<td class="tableHeader tableHeader-' + clicked_table_name + '"" title="' + table_[i][j][0] + '" rowspan="' + table_[i][j][1] + '" colspan="' + table_[i][j][2] + '" style="min-width: 145px">'
                    tr += '<div class="pos_rl" del="no">'
                    tr += '<label class="ref">'
                    chk = 'checked'
                    tr += '<input class="with-gap" name="group1" type="radio" ' + chk + '/>'
                    tr += '<span>Ref key</span>'
                    tr += '</label>'
                    tr += '<img src="images/trash.svg" class="delete_col trash">'
                    tr += '<select class="tableAlias-' + clicked_table_name + '-' + j + '"><option value="">Select Alias</option>' + opts + '</select><br><p class="tableHeader-text">' + table_[i][j][0] + '</p>'
                    tr += '</div>'
                    tr += '</td>'
                } else {
                    tr += '<td rowspan="' + table_[i][j][1] + '" colspan="' + table_[i][j][2] + '">' + table_[i][j][0] + '</td>'
                }
            }
            tr += '</tr>'
        }
        tr += '</table></div>'
        tr += '<div class="footerClass footerClass-' + clicked_table_name + '"><input type="text" value="' + globalFooter + '" placeholder="Footer"><img src="images/crop.svg" class="cropThis"></div>'
        tr += '<div style="display: inline-block; margin-left: 55px;">'
        tr += '<label class="checkbox">Multi Page &nbsp;<input type="checkbox" class="checkbox__input multiPage-' + clicked_table_name + '"/><span class="checkbox__checkmark"></span></label>'
        tr += '</div>'
        $(".allTableResults-" + clicked_table_name).html(tr)
        // table_data_final = {
        //     trained_data: table_data,
        //     trained_table: tbl
        // }
        // $(".allTableResults select").formSelect();
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
            obj.color = 'red'
            pg = getAdjPage(y1);
            obj.page = pg
            obj.y = y1 - adjtop(pg);
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
            obj.color = 'red'
            pg = getAdjPage(y1);
            obj.page = pg
            obj.y = y1 - adjtop(pg);
            ////("---split----", $(".vertical_line").length);
            drawVerLines(obj, id);
        }

        $(".tryLines").show()

    })

    function getAdjPage(tp) {
        adj_top = 0;
        page = 0;
        img_count = $(".imageCount").length;
        for (var i = 0; i < img_count; i++) {
            adj_top += $('img.imageCountNum' + i).height();
            if (adj_top >= tp) {
                i = img_count
                break
            }
            page += 1
        }
        return page
    }

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

        $(".tryLines").show()

    })

    function dp_page() {
        var dp_nums = dpi_page;
        if (dp_nums.length > 0) {
            for (let i = 0; i < dp_nums.length; i++) {
                var dp_top = adjtop(i);
                dp_top += 14;
                $('.HorZOn').append('<div class="dp_class" style="position: absolute;top:' + dp_top + 'px;font-size: 12px;left:20px">' + dp_nums[i] + ' DPI</div>')
            }
        }
    }

    function adjtop(id) {
        adj_top = 0;
        for (var i = 0; i < id; i++) {
            adj_top += $('img.imageCountNum' + i).height();
        }
        return -adj_top
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

    function showTrainedTable(tb_data) {
        console.log(tb_data);
        clicked_table_name = uq_name_class = "table1";
        if (tb_data && tb_data.length > 0) {
            $(".table_name .table1").html('Edit');
            t = '<div>'
            t += '<p class="mr-t-10">Please crop the table</p>'
            t += '<div class="intialTableConfirm-' + uq_name_class + ' mr-t-10"><button class="tryLines" onclick="return false;">Proceed</button><button class="tryRetry" onclick="return false;">Retry</button></div>'
            t += '<div class="allTablesShow-' + uq_name_class + ' mr-t-20" style="overflow-x: auto;"></div>'
            t += '<div class="anyBtns-' + uq_name_class + ' mr-t-20"></div>'
            t += '</div>'
            t += '<div class="allTableResults allTableResults-' + uq_name_class + '">'
            t += '</div>'

            $(".btns_for_table ." + uq_name_class).html(t)

            $(".tryLines").hide();
            table_data = tb_data[0][0];
            trainedTable = table_data
            table_output[clicked_table_name] = table_data
            lines_data = resizeRetrainLines(tb_data[0][1]['lines']);
            alias_data = tb_data[0][1]['alias'];
            // footerData[clicked_table_name] = $('.footerClass input').val();
            footerData[clicked_table_name] = tb_data[0][1]['footer']
            globalFooter = tb_data[0][1]['footer']
            table_flag = true;
            showTable(table_data, alias_data, globalFooter);
        }
    }

    function resizeRetrainLines(lines) {
        var lines_return = {hors: [], vers: []}
        var hors = lines ? lines.hors : [];
        resize_factor1 = $(".image_box").width() / default_width;
        for (var i = 0; i < hors.length; i++) {
            hors[i].height = hors[i].height * resize_factor1
            hors[i].width = hors[i].width * resize_factor1
            hors[i].x = hors[i].x * resize_factor1
            hors[i].y = hors[i].y * resize_factor1
            lines_return.hors.push(hors[i])
        }
        var vers = lines ? lines.vers : [];
        for (var i = 0; i < vers.length; i++) {
            vers[i].height = vers[i].height * resize_factor1
            vers[i].width = vers[i].width * resize_factor1
            vers[i].x = vers[i].x * resize_factor1
            vers[i].y = vers[i].y * resize_factor1
            lines_return.vers.push(vers[i])
        }

        return lines_return
    }

    $("body").on("click", ".saveBtn", function () {
        template_name = $(".template_name_val").val();
        // template_name = ""
        if ($.trim(template_name) != "") {
            temp_check = vendor_list.indexOf(template_name)
            procd = 0;
            if (temp_check == -1) {
                $.confirm({
                    title: 'Confirm',
                    content: 'Confirm with new details?',
                    buttons: {
                        ok: function () {
                            saveFunc(template_name)
                        },
                        cancel: function () { }
                    }
                })
            } else {
                saveFunc(template_name)
            }
        }
    })

    $("body").on("click", ".closeBtn", function () {
        closePage()
    })

    function closePage() {
        var docUrl = (window.location != window.parent.location) ? document.referrer : document.location.href;
        var splt_check = docUrl.split("/")
        if (splt_check[splt_check.length - 1] != 'ace' && splt_check[splt_check.length - 2] != 'ace') {
            docUrl += 'ace'
        }
        console.log(docUrl)
        localStorage.setItem("fromTraining", JSON.stringify({case_id: case_id}))
        window.top.location = "http://52.66.221.196/ace/#/home/maker_screen_2";
    }

    // $("body").on("click", ".forSave", function () {
    //     mainArr = [];
    //     customMainArr = [];
    //     dynamicMainArr = []
    //     totalboxess = $(".fieldTrain").length;

    //     outputTabFields = {}
    //     notFoundUnits = []
    //     empt___ = 0
    //     for (var ii = 0; ii < totalboxess; ii++) {
    //         id = $(".fieldTrain")[ii].attributes['id'].value;
    //         target = $(".fieldTrain")[ii].attributes['target'].value;
    //         box_id = id + "-" + target;
    //         width_ = $('#imageCountNum0').width();
    //         if ($(".fieldValid-" + box_id).find(".keyword_check_img").length > 0 && clicked_fields[box_id]) {
    //             mainObj = {};
    //             mainObj.field = $(".fieldTrain")[ii].attributes['field'].value;
    //             mainObj.value = $(".fieldTrain")[ii].attributes['value'].value;
    //             for (let b_i = 0; b_i < field_areas_obj[box_id].length; b_i++) {
    //                 if (attr_field_data_obj[box_id] && attr_field_data_obj[box_id][b_i]) {
    //                     field_areas_obj[box_id][b_i].attributes = attr_field_data_obj[box_id][b_i]
    //                 }
    //                 field_areas_obj[box_id][b_i].matching_threshold = wrap_text_obj[box_id]['threshold_values'][b_i]
    //             }
    //             mainObj.coordinates = field_areas_obj[box_id] || [];
    //             mainObj.width = width_;
    //             mainObj.wrap_text = wrap_text_obj[box_id].wrap_text
    //             mainObj.multiple_values = wrap_text_obj[box_id].multiple_values
    //             mainObj.false_negative = wrap_text_obj[box_id].false_negative
    //             mainObj.false_positive = wrap_text_obj[box_id].false_positive
                
    //             mainObj.page = field_areas_obj[box_id].length > 0 ? field_areas_obj[box_id][0].page : -1;
    //             if ($(".fieldTrain")[ii].attributes['field_type'].value === "custom") {
    //                 customMainArr.push(mainObj)
    //             }
    //             else if ($(".fieldTrain")[ii].attributes['field_type'].value === "dynamic") {
    //                 dynamicMainArr.push(mainObj)
    //             }
    //             else {
    //                 mainArr.push(mainObj);
    //             }
    //         }
    //     }

    //     for (const key in tab_field_def) {
    //         if (tab_field_def[key].length > 0) {
    //             for (let i = 0; i < tab_field_def[key].length; i++) {
    //                 cls = tab_field_def[key][i].unique_name.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
    //                 if ($(".unitSelect-" + cls).length > 0) {
    //                     outputTabFields[tab_field_def[key][i].unique_name] = $(".unitSelect-" + cls).val();
    //                     field_name_alert = $(".unitSelect-" + cls).attr('field')
    //                     if (tab_field_def[key][i].mandatory && !nullCheck($(".unitSelect-" + cls).val())) {
    //                         notFoundUnits.push(field_name_alert + ' - ' + tab_field_def[key][i].display_name);
    //                         empt___ = 2;
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     mainDataToSend.units = Object.assign({}, outputTabFields);

    //     if (empt___ == 0) {
    //         if (nullCheck("value") || retrain) {
    //             mand_check = 0
    //             notFoundFields = []
    //             // mandatoryFields = []
    //             for (var n = 0; n < mandatoryFields.length; n++) {
    //                 idx__ = mainArr.find(o => o.field === mandatoryFields[n]);
    //                 if (idx__ == -1 || (idx__ > -1 && nullCheck(mainArr[idx].value))) {
    //                     notFoundFields.push(mandatoryFields[n]);
    //                     mand_check = 1;
    //                 }
    //             }
    //             for (i = 0; i < notFoundFields.length; i++) {
    //                 var temp_obj = {}
    //                 temp_obj['field'] = notFoundFields[i]
    //                 temp_obj['value'] = ''
    //                 temp_obj['page'] = -1
    //                 temp_obj['not_in_invoice'] = true;
    //                 temp_obj['value'] = ""
    //                 temp_obj['coordinates'] = []
    //                 temp_obj['width'] = width_
    //                 mainArr.push(temp_obj)
    //             }
    //             mainDataToSend.fields = Object.assign({}, mainArr);
    //             mainDataToSend.custom_fields = Object.assign({}, customMainArr)
    //             mainDataToSend.dynamic_fields = Object.assign({}, dynamicMainArr)

    //             // Custom Fields Rules

    //             len = $(".cfr_group").length
    //             cfr_main_arr = []
    //             cfr_error = 0
    //             cfr_error_msg = ''
    //             for (i = 0; i < len; i++) {
    //                 field_check = 0
    //                 brackets_check = 0
    //                 cn = $(".cfr_group")[i].attributes.len.value
    //                 j_len = $(".cfr_group_" + cn).find('.cfr_box').length
    //                 rule = ''
    //                 identifiers = []
    //                 template_di = []
    //                 for (j = 0; j < j_len; j++) {
    //                     value = ''
    //                     _type = $(".cfr_group_" + cn + " .cfr_box")[j].attributes.type.value
    //                     threshold = ''
    //                     text_value = ''

    //                     template_obj = {}
    //                     if (_type == 'ocr') {
    //                         value = $(".cfr_group_" + cn + " .cfr_box")[j].children[1].value
    //                         threshold = $(".cfr_group_" + cn + " .cfr_box")[j].children[2].value;
    //                         text_value = $(".cfr_group_" + cn + " .cfr_box")[j].children[3].value;
    //                         field_check += 1
    //                         if (!value) {
    //                             cfr_error = 1
    //                             cfr_error_msg = _type + ' value is missing'
    //                         }
    //                     }
    //                     if (_type == 'custom') {
    //                         value = $(".cfr_group_" + cn + " .cfr_box")[j].children[1].value
    //                         threshold = $(".cfr_group_" + cn + " .cfr_box")[j].children[2].value;
    //                         text_value = $(".cfr_group_" + cn + " .cfr_box")[j].children[3].value;
    //                         field_check += 1
    //                         if (!text_value) {
    //                             cfr_error = 1
    //                             cfr_error_msg = _type + ' value is missing'
    //                         }
    //                     }
    //                     if (value && value != '(' && value != ')' && _type != 'custom' && _type != 'ocr' && _type != 'opertor' && _type != 'equals') {
    //                         field_check -= 1
    //                     }

    //                     if (_type == '(' || _type == ')') {
    //                         template_obj.type = _type
    //                         value = _type
    //                     }

    //                     if (_type == 'operator' || _type == 'equals') {
    //                         template_obj.type = _type
    //                         value = $(".cfr_group_" + cn + " .cfr_box")[j].children[1].value
    //                         template_obj.condition = value
    //                     }

    //                     rule += ' ' + value
    //                     if (_type != 'condition' && _type != 'equals' && _type != '(' && _type != ')') {
    //                         o = {}
    //                         o.text = text_value
    //                         o.type = _type
    //                         o.field = value
    //                         o.threshold = threshold
    //                         identifiers.push(o)

    //                         template_obj.type = _type
    //                         template_obj.field = value
    //                         template_obj.threshold = threshold
    //                         template_obj.text_value = text_value
    //                     }
    //                     template_di.push(template_obj)
    //                 }

    //                 if (d_i_validator(template_di)) {
    //                     cfr_obj = {}
    //                     cfr_obj.execution_rule = $.trim(rule)
    //                     cfr_obj.identifiers = identifiers
    //                     cfr_main_obj = {}
    //                     cfr_main_obj.priority = i + 1
    //                     cfr_main_obj.rule = cfr_obj
    //                     cfr_main_obj.template = template_di
    //                     cfr_main_arr.push(cfr_main_obj)
    //                     if (cfr_error == 0 && field_check != 1) {
    //                         cfr_error = 1
    //                         cfr_error_msg = 'Conditions between fields are missing'
    //                     }
    //                 } else {
    //                     cfr_error = 1
    //                     cfr_error_msg = 'Incorrect Brackets'
    //                 }
    //             }

    //             mainDataToSend.custom_fields_rules = cfr_main_arr


    //             // Documnet Identifiers Logic
    //             len = $(".di_group") ? $(".di_group").length : 0
    //             di_main_arr = []
    //             di_error = 0
    //             di_error_msg = ''
    //             for (i = 0; i < len; i++) {
    //                 field_check = 0
    //                 brackets_check = 0
    //                 cn = $(".di_group")[i].attributes.len.value
    //                 j_len = $(".di_group_" + cn).find('.di_box').length
    //                 rule = ''
    //                 identifiers = []
    //                 template_di = []
    //                 for (j = 0; j < j_len; j++) {
    //                     value = ''
    //                     _type = $(".di_group_" + cn + " .di_box")[j].attributes.type.value
    //                     threshold = ''
    //                     text_value = ''

    //                     template_obj = {}
    //                     if (_type == 'ocr') {
    //                         value = $(".di_group_" + cn + " .di_box")[j].children[1].value
    //                         threshold = $(".di_group_" + cn + " .di_box")[j].children[2].value;
    //                         text_value = $(".di_group_" + cn + " .di_box")[j].children[3].value;
    //                     }
    //                     if (_type == 'meta') {
    //                         text_value = meta_fields[value]
    //                         value = $(".di_group_" + cn + " .di_box")[j].children[1].value
    //                         threshold = $(".di_group_" + cn + " .di_box")[j].children[2].value;
    //                     }
    //                     if (_type == 'ocr' || _type == 'meta') {
    //                         field_check += 1
    //                         if (!value) {
    //                             di_error = 1
    //                             di_error_msg = _type + ' value is missing'
    //                         }
    //                     }
    //                     if (value && value != '(' && value != ')' && _type != 'ocr' && _type != 'meta') {
    //                         field_check -= 1
    //                     }
                        
    //                     if (_type == '(' || _type == ')') {
    //                         value = _type
    //                         template_obj.type = _type
    //                     }

    //                     if (_type == 'condition') {
    //                         // value = $(".di_group_" + cn + " .di_box")[j].children[1].value
    //                         template_obj.type = _type
    //                         template_obj.condition = value
    //                         // if ($(".di_box_" + cn + "_" + (j - 1)).length > 0 && $(".di_box_" + cn + "_" + (j - 1)).attr('type') != '(') {

    //                         // }
    //                         // else {
    //                         //     template_obj.condition = value;
    //                         // }
    //                         //newly added
    //                         if ($(".di_box_" + cn + "_" + (j - 1)).length > 0 && $(".di_box_" + cn + "_" + (j - 1)).attr('type') != '(') {
    //                         }
    //                         else {
    //                             di_error = 1
    //                             di_error_msg = 'Incorrect condition'
    //                         }
    //                         if ($(".di_box_" + cn + "_" + (j + 1)).length > 0 &&  $(".di_box_" + cn + "_" + (j + 1)).attr('type') != ')') {
    //                         }
    //                         else {
    //                             di_error = 1
    //                             di_error_msg = 'Incorrect condition'
    //                         }
    //                     }

    //                     rule += ' ' + value
    //                     if (_type != 'condition' && _type != '(' && _type != ')') {
    //                         o = {}
    //                         o.text = text_value
    //                         o.type = _type
    //                         o.field = value
    //                         o.threshold = threshold
    //                         identifiers.push(o)

    //                         template_obj.type = _type
    //                         template_obj.field = value
    //                         template_obj.threshold = threshold
    //                         template_obj.text_value = text_value
    //                     }
    //                     template_di.push(template_obj)
    //                 }

    //                 if (d_i_validator(template_di)) {
    //                     di_obj = {}
    //                     di_obj.execution_rule = $.trim(rule)
    //                     di_obj.identifiers = identifiers
    //                     di_main_obj = {}
    //                     di_main_obj.priority = i + 1
    //                     di_main_obj.rule = di_obj
    //                     di_main_obj.template = template_di
    //                     di_main_arr.push(di_main_obj)
    //                     if (di_error == 0 && field_check != 1) {
    //                         di_error = 1
    //                         di_error_msg = 'Conditions between fields are missing'
    //                     }
    //                 } else {
    //                     di_error = 1
    //                     di_error_msg = 'Incorrect Brackets'
    //                 }
    //             }

    //             mainDataToSend.document_identifiers = di_main_arr

    //             if (di_error) {
    //                 $.alert(di_error_msg, 'DI Alert');
    //             } else {
    //                 $(".head").removeClass('bg-blue')
    //                 aliasCheck = 0
    //                 table_unique_data

    //                 for (var i = 0; i < table_unique_data.length; i++) {
    //                     var clicked_table_name_save = table_unique_data[i].unique_name;
    //                     headers = $(".tableHeader-" + clicked_table_name_save);

    //                     table_data = {}
    //                     for (var i = 0; i < headers.length; i++) {
    //                         table_data['v' + (i + 1)] = {}
    //                         table_data['v' + (i + 1)].label = $.trim(headers[i].attributes.title.value) //header
    //                         del = $.trim(headers[i].children[0].attributes.del.value);
    //                         table_data['v' + (i + 1)].del = del //del
    //                         ali = $(".tableAlias-" + clicked_table_name_save + "-" + i).val()
    //                         table_data['v' + (i + 1)].alias = ali //alias
    //                         table_data['v' + (i + 1)].ref = headers[i].children[0].children[0].children[0].checked //alias
    //                         if (!ali && del === 'no') {
    //                             aliasCheck = 1
    //                         }
    //                     }
    //                     var newFooter = $('.footerClass-' + clicked_table_name + ' input').val();

    //                     table_data['multiPageCheck'] = $(".multiPage-" + clicked_table_name_save).is(":checked");

    //                     table_data["h2v1"] = {
    //                         "label": newFooter,
    //                         "type": "",
    //                         "prefix": "",
    //                         "suffix": "",
    //                         "split_lines": "",
    //                         "repeatable": ""
    //                     }

    //                     hor_lines = $(".horizontal_line");
    //                     hors = []
    //                     for (var i = 0; i < hor_lines.length; i++) {
    //                         obj = {};
    //                         obj.page = hor_lines[i].attributes.page.value;

    //                         tp = adjtop(hor_lines[i].attributes.page.value)

    //                         obj.x = Number(hor_lines[i].style.left.replace('px', ''));
    //                         obj.y = Number(hor_lines[i].style.top.replace('px', '')) - tp;
    //                         obj.width = Number(hor_lines[i].style.width.replace('px', ''));
    //                         obj.height = Number(hor_lines[i].style.height.replace('px', ''));
    //                         obj.color = hor_lines[i].attributes.color.value;
    //                         hors.push(obj)
    //                     }

    //                     ver_lines = $(".vertical_line");
    //                     vers = [];
    //                     for (var i = 0; i < ver_lines.length; i++) {
    //                         obj = {};

    //                         tp = adjtop(ver_lines[i].attributes.page.value)

    //                         obj.x = Number(ver_lines[i].style.left.replace('px', ''));
    //                         obj.y = Number(ver_lines[i].style.top.replace('px', '')) - tp;
    //                         obj.width = Number(ver_lines[i].style.width.replace('px', ''));
    //                         obj.height = Number(ver_lines[i].style.height.replace('px', ''));
    //                         obj.color = ver_lines[i].attributes.color.value;
    //                         obj.page = ver_lines[i].attributes.page.value;
    //                         vers.push(obj)
    //                     }

    //                     table_data_final[clicked_table_name] = {
    //                         trained_data: table_data,
    //                         trained_table: table_output[clicked_table_name],
    //                         table_lines: {hors: hors, vers: vers}
    //                     }
    //                 }
    //                 if (retrain) {
    //                     $(".template_name_val").val(template_name_retrain)
    //                 }
    //                 if (aliasCheck) {
    //                     $.confirm({
    //                         title: 'Alert',
    //                         content: "Alias are empty. Are are you sure want to continue?",
    //                         buttons: {
    //                             skip: function () {
    //                                 $(".template_name_modal").show()
    //                             },
    //                             cancel: function () { }
    //                         }
    //                     })
    //                 } else {
    //                     $(".template_name_modal").show()
    //                 }
    //             }
    //         } else { }

    //     } else if (empt___ == 2) {
    //         notFoundUnits = $.unique(notFoundUnits);
    //         $.alert("Please select " + notFoundUnits.join(', '), 'Alert');
    //     }

    // })
    $("body").on("click", ".forSave", function () {
        mainArr = [];
        totalboxess = $(".fieldTrain").length;

        outputTabFields = {}
        notFoundUnits = []
        empt___ = 0
        for (var ii = 0; ii < totalboxess; ii++) {
            id = $(".fieldTrain")[ii].attributes['id'].value;
            target = $(".fieldTrain")[ii].attributes['target'].value;
            box_id = id + "-" + target;
            width_ = $('#imageCountNum0').width();
            if ($(".fieldValid-" + box_id).find(".keyword_check_img").length > 0 && clicked_fields[box_id]) {
                mainObj = {};
                mainObj.field = $(".fieldTrain")[ii].attributes['field'].value;
                mainObj.value = $(".fieldTrain")[ii].attributes['value'].value;
                mainObj.coordinates = field_areas_obj[box_id] || [];
                mainObj.width = width_;
                mainObj.wrap_text = wrap_text_obj[box_id];
                mainObj.page = field_areas_obj[box_id].length > 0 ? field_areas_obj[box_id][0].page : -1;
                mainArr.push(mainObj);
            }
        }

        if (empt___ == 0) {
            if (nullCheck("value") || retrain) {
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

                len = $(".di_group").length
                di_main_arr = []
                di_error = 0
                di_error_msg = ''
                for (i = 0; i < len; i++) {
                    field_check = 0
                    brackets_check = 0
                    cn = $(".di_group")[i].attributes.len.value
                    j_len = $(".di_group_" + cn).find('.di_box').length
                    rule = ''
                    identifiers = []
                    template_di = []
                    for (j = 0; j < j_len; j++) {
                        value = $(".di_box_" + cn + "_" + j).attr("value")
                        _type = $(".di_box_" + cn + "_" + j).attr("type")
                        threshold = ''
                        text_value = ''
                        
                        template_obj = {}
                        if (_type == 'ocr') {
                            threshold = $(".di_box_" + cn + "_" + j).find(".percentage").val()
                            text_value = $(".di_box_" + cn + "_" + j).find(".di_input").val()
                        }
                        if (_type == 'ocr' || _type == 'meta') {
                            field_check += 1
                            if (!value) {
                                di_error = 1
                                di_error_msg = _type + ' value is missing'
                            }
                        }
                        if (value && value != '(' && value != ')' && _type != 'ocr' && _type != 'meta') {
                            field_check -= 1
                        }
                        
                        if (_type == '(' || _type == ')') {
                            template_obj.type = _type
                        }
                        
                        if (_type == 'condition') {
                            template_obj.type = _type
                            template_obj.condition = value
                            if ($(".di_box_" + cn + "_" + (j - 1)).length > 0 && $(".di_box_" + cn + "_" + (j - 1)).attr('type') != '(') {
                            }
                            else {
                                di_error = 1
                                di_error_msg = 'Incorrect condition'
                            }
                            if ($(".di_box_" + cn + "_" + (j + 1)).length > 0 &&  $(".di_box_" + cn + "_" + (j + 1)).attr('type') != ')') {
                            }
                            else {
                                di_error = 1
                                di_error_msg = 'Incorrect condition'
                            }
                        }

                        rule += ' ' + value
                        if (_type != 'condition' && _type != '(' && _type != ')') {
                            o = {}
                            o.text = text_value
                            o.type = _type
                            o.field = value
                            o.threshold = threshold
                            identifiers.push(o)
                            
                            template_obj.type = _type
                            template_obj.field = value
                            template_obj.threshold = threshold
                            template_obj.text_value = text_value
                        }
                        template_di.push(template_obj)
                    }
                    
                    if (d_i_validator(template_di)) {
                        di_obj = {}
                        di_obj.execution_rule = $.trim(rule)
                        di_obj.identifiers = identifiers
                        di_main_obj = {}
                        di_main_obj.priority = i + 1
                        di_main_obj.rule = di_obj
                        di_main_obj.template = template_di
                        di_main_arr.push(di_main_obj)
                        if (di_error == 0 && field_check != 1) {
                            di_error = 1
                            di_error_msg = 'Conditions between fields are missing'
                        }
                    }
                    else {
                        di_error = 1
                        di_error_msg = 'Incorrect Brackets'
                    }
                }

                mainDataToSend.document_identifiers = di_main_arr

                if (di_error) {
                    $.alert(di_error_msg, 'DI Alert');
                } else {
                    $(".head").removeClass('bg-blue')
                    aliasCheck = 0
                    table_unique_data

                    for (var i = 0; i < table_unique_data.length; i++) {
                        var clicked_table_name_save = table_unique_data[i].unique_name;
                        headers = $(".tableHeader-" + clicked_table_name_save);

                        table_data = {}
                        for (var i = 0; i < headers.length; i++) {
                            table_data['v' + (i + 1)] = {}
                            table_data['v' + (i + 1)].label = $.trim(headers[i].attributes.title.value) //header
                            del = $.trim(headers[i].children[0].attributes.del.value);
                            table_data['v' + (i + 1)].del =  del
                            ali = $(".tableAlias-" + clicked_table_name_save + "-" + i).val()
                            table_data['v' + (i + 1)].alias = ali //alias
                            table_data['v' + (i + 1)].ref = headers[i].children[0].children[0].children[0].checked //alias
                            if (!ali && del === 'no') {
                                aliasCheck = 1
                            }
                        }
                        var newFooter = $('.footerClass-' + clicked_table_name_save + ' input').val();

                        table_data["h2v1"] = {
                            "label": newFooter,
                            "type": "",
                            "prefix": "",
                            "suffix": "",
                            "split_lines": "",
                            "repeatable": ""
                        }

                        hor_lines = $(".horizontal_line");
                        hors = []
                        for (var i = 0; i < hor_lines.length; i++) {
                            obj = {};
                            obj.page = hor_lines[i].attributes.page.value;

                            tp = adjtop(hor_lines[i].attributes.page.value)

                            obj.x = Number(hor_lines[i].style.left.replace('px', ''));
                            obj.y = Number(hor_lines[i].style.top.replace('px', '')) - tp;
                            obj.width = Number(hor_lines[i].style.width.replace('px', ''));
                            obj.height = Number(hor_lines[i].style.height.replace('px', ''));
                            obj.color = hor_lines[i].attributes.color.value;
                            hors.push(obj)
                        }

                        ver_lines = $(".vertical_line");
                        vers = [];
                        for (var i = 0; i < ver_lines.length; i++) {
                            obj = {};

                            tp = adjtop(ver_lines[i].attributes.page.value)

                            obj.x = Number(ver_lines[i].style.left.replace('px', ''));
                            obj.y = Number(ver_lines[i].style.top.replace('px', '')) - tp;
                            obj.width = Number(ver_lines[i].style.width.replace('px', ''));
                            obj.height = Number(ver_lines[i].style.height.replace('px', ''));
                            obj.color = ver_lines[i].attributes.color.value;
                            obj.page = ver_lines[i].attributes.page.value;
                            vers.push(obj)
                        }
                        table_data['multiPageCheck'] = $(".multiPage-" + clicked_table_name_save).is(":checked");

                        table_data_final[clicked_table_name] = {
                            trained_data: table_data,
                            trained_table: table_output[clicked_table_name],
                            table_lines: {hors: hors, vers: vers}
                        }
                    }
                    if (retrain) {
                        $(".template_name_val").val(template_name_retrain)
                    }
                    if (aliasCheck) {
                        $.confirm({
                            title: 'Alert',
                            content: "Alias are empty. Are are you sure want to continue?",
                            buttons: {
                                skip: function () {
                                    $(".template_name_modal").show()
                                },
                                cancel: function () {}
                            }
                        })
                    } else {
                        $(".template_name_modal").show()
                    }
                }
            } else {}

        } else if (empt___ == 2) {
            notFoundUnits = $.unique(notFoundUnits);
            $.alert("Please select " + notFoundUnits.join(', '), 'Alert');
        }

    })
    function d_i_validator(str) {
        // depth of the parenthesis
        // ex : ( 1 ( 2 ) ( 2 ( 3 ) ) )
        var depth = 0;
        // for each char in the string : 2 cases
        for (var i in str) {
            if (str[i].type == '(') {
                // if the char is an opening parenthesis then we increase the depth
                depth++;
            } else if (str[i].type == ')') {
                // if the char is an closing parenthesis then we decrease the depth
                depth--;
            }
            //  if the depth is negative we have a closing parenthesis 
            //  before any matching opening parenthesis
            if (depth < 0) return false;
        }
        // If the depth is not null then a closing parenthesis is missing
        if (depth > 0) return false;
        // OK !
        return true;
    }

    function saveFunc(template_name) {
        mainDataToSend.table = table_data_final['table1'] ? table_data_final['table1'] : {}
        mainDataToSend.template_name = template_name;
        mainDataToSend.file_name = file_id;
        mainDataToSend.case_id = case_id;
        mainDataToSend.img_width = $("#imageCountNum0").width();
        mainDataToSend.resize_factor = $("#imageCountNum0").width() / 670;
        mainDataToSend.retrain = retrain;
        mainDataToSend.user = user_name;
        mainDataToSend.temp_type = 'new'
        mainDataToSend.retrain = retrain
        mainDataToSend.tenant_id = tenant_id
        mainDataToSend.keywords = all_keywords_data;
        if (retrain) {
            mainDataToSend.removed_cases = wrap_text_obj.removed_cases;
        }
        console.log(mainDataToSend);

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
        loading(true);
        $.ajax(settings11).done(function (msg) {
            msg = JSON.parse(msg)
            loading(false);
            $(".fieldsDisplayTest").html('');
            if (msg.flag) {
                $(".template_name_modal").hide()
                $.alert("Successfully Updated", 'Sucess');
                closePage()
            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
                loading(false);
            } else {
                loading(false);
                $.alert(msg.message, 'Alert');
            }
        }).fail(function () {
            $.alert('Something went wrong', 'Alert');
            loading(false);
        });
    }
    $("body").on("click", ".forSkip", function () {
        $(".skipCheckModal").show()
    })
    $('body').on('click', '.okSkipbtn', function () {
        // $(".forSave").attr("disabled", false);
        $('.forSkip').attr('disabled', true)
        $(".skipCheckModal").hide()
    })

    //select document identifier
    $('body').on('click', '.identifier', function () {
        var list_di = $(this).attr('value');
        if ($(this).hasClass('selected_identifier')) {
            $(this).removeClass('selected_identifier');
            var index = document_identifiers.indexOf(list_di);
            document_identifiers.splice(index, 1);
        } else {
            $(this).addClass('selected_identifier');
            document_identifiers.push(list_di);
        }
    })

    $("body").on("click", ".closeTestView", function () {
        clickFlag = true;
        $(this).hide();
        $('.testConfirmBtn').hide()
        $('.nextToDi').show()
        $('.testBtn').show();
        $('.training-layout').removeClass('.doc_iden_training')
        $(".field_test_results").html('')
        showBtns("field")
    })

    function showBtns(type) {
        $(".line").remove()
        colortype = type
        if (type === 'keyword') {
            $(".fieldTrain").removeClass('selected').removeClass('op-p5')
            $(".field_val_display").html('')
            clicked_id = ''
            selectedBox = ''
            enableKeywordCrop();
            $(".field_test_results").html('')
            $(".training-layout").removeClass("doc_iden_training")
            $('.train_tab .head').removeClass('bg-blue');
            $('.keyword .head').addClass('bg-blue');
            $(".allFieldResults").hide();
            $(".allTables").addClass('hidden')
            $(".btns_for_keys").show();
            $(".btns_for_Di").hide();
            $(".btns_for_cfr").hide();
            $(".btns_for_fields").hide();
            $(".btns_for_table").hide();
            $(".btns_for_test").hide();
            $(".header_crop").hide();
            $('.more_options_screen').removeClass('open')

        } else if (type === 'cfr') {
            $(".header_crop").hide();
            $('.training-layout').removeClass('tableTraining')
            $(".fieldTrain").removeClass('selected').removeClass('op-p5')
            clicked_id = ''
            selectedBox = ''
            $(".field_val_display").html('')

            $(".field_test_results").html('')
            $(".training-layout").addClass("doc_iden_training")
            $('.train_tab .head').removeClass('bg-blue');
            $('.cfr_display .head').addClass('bg-blue');
            $('.more_options_screen').removeClass('open')

            $(".allFieldResults").hide();

            $(".allTables").addClass('hidden')

            $(".btns_for_keys").hide();
            $(".btns_for_Di").hide();
            $(".btns_for_cfr").show();
            $(".btns_for_fields").hide();
            $(".btns_for_table").hide();
            $(".btns_for_test").hide();
        } else if (type === 'di') {
            $(".header_crop").hide();
            $('.training-layout').removeClass('tableTraining')
            $(".fieldTrain").removeClass('selected').removeClass('op-p5')
            clicked_id = ''
            selectedBox = ''
            $(".field_val_display").html('')

            $(".field_test_results").html('')
            $(".training-layout").addClass("doc_iden_training")
            $('.train_tab .head').removeClass('bg-blue');
            $('.di_display .head').addClass('bg-blue');
            $('.more_options_screen').removeClass('open')

            $(".allFieldResults").hide();

            $(".allTables").addClass('hidden')

            $(".btns_for_keys").hide();
            $(".btns_for_Di").show();
            $(".btns_for_cfr").hide();
            $(".btns_for_fields").hide();
            $(".btns_for_table").hide();
            $(".btns_for_test").hide();
        } else if (type === 'field') {
            $('.train_tab .head').removeClass('bg-blue');
            $('.fields .head').addClass('bg-blue');

            $(".allTables").addClass('hidden')
            $(".allFieldResults").show();
            $(".header_crop").hide();
            $(".allFieldResults").removeClass('hidden')
            $(".btns_for_keys").hide();
            $(".btns_for_Di").hide();
            $(".btns_for_cfr").hide();
            $(".btns_for_fields").show();
            $(".btns_for_table").hide();
            if (!field_flag) {
                $(".field_test_results").html('')
                $(".training-layout").removeClass("doc_iden_training")
                $(".btns_for_test").hide();
            }

        } else if (type === 'field_test') {
            $(".field_test_results").html('')
            $(".training-layout").addClass("doc_iden_training")
            $(".header_crop").hide();
            $('.train_tab .head').removeClass('bg-blue');
            $('.fields .head').addClass('bg-blue');

            $(".allFieldResults").removeClass('hidden')

           $(".allTables").addClass('hidden')

            $(".btns_for_keys").hide();
            $(".btns_for_Di").hide();
            $(".btns_for_cfr").hide();
            $(".btns_for_fields").hide();
            $(".btns_for_table").hide();
            $(".btns_for_test").show();
        } else if (type === 'table') {
            $('.more_options_screen').removeClass('open')
            if (table_flag) {
                $(".training-layout").addClass("tableTraining")
            } else {
                $(".training-layout").removeClass("tableTraining")
            }
            $(".field_val_display").html('')
            $(".fieldTrain").removeClass('selected').removeClass('op-p5')
            clicked_id = ''
            selectedBox = ''
            $(".field_test_results").html('')
            $(".allFieldResults").addClass('hidden')
            $(".allFieldResults").hide();

            $(".training-layout").removeClass("doc_iden_training")

            $('.train_tab .head').removeClass('bg-blue');
            $('.table .head').addClass('bg-blue');

            $(".allTables").removeClass('hidden')

            $(".btns_for_keys").hide();
            $(".btns_for_Di").hide();
            $(".btns_for_cfr").hide();
            $(".btns_for_fields").hide();
            $(".btns_for_table").show();
            $(".btns_for_test").hide();
        } else {
            $(".fieldTrain").removeClass('selected').removeClass('op-p5')
            clicked_id = ''
            selectedBox = ''
            $(".field_test_results").html('')
            $(".field_val_display").html('')
            $(".btns_for_keys").hide();
            $(".btns_for_Di").hide();
            $(".btns_for_cfr").hide();
            $(".btns_for_fields").hide();
            $(".btns_for_table").hide();
            $(".btns_for_test").hide();
            $(".allFieldResults").hide();
            $(".header_crop").hide();

        }
    }
    $("body").on("change", ".forceTemp", function () {
        val = $(this).val();
        retrain_this(val, false)
    })

    function reverseObj(data) {
        var obj = {}
        Object.keys(data).forEach(element => {
            obj[data[element]] = element
        });

        return obj
    }
    function retrain_this(val, ft_check) {
        template_name_retrain = val;
        obj = {}
        obj.case_id = case_id;
        obj.file_name = file_id;
        obj.force_check = 'yes';
        obj.template_name = template_name_retrain;
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
        loading(true);
        $(".field_test_results").html('')
        $.ajax(settings11).done(function (msg) 
		{
            msg = JSON.parse(msg)
            if (msg.flag) {
                trained_fields = msg.fields_trained
                new_retrain = msg.file_trace
                retrain = true
                showpredictedfields = msg.showpredictedfields

                initial_shows(msg, ft_check)
                $('.initial_view').hide();
                $('.secondary_view').show();
                $('.allFieldResults').show()
                showBtns('field_test')

                generate_ft_predicted(msg.display_name_mapping, msg.predicted_fields)

                if (new_retrain) {
                    show_retrain_templates(new_retrain);
                }

                generateCustomFieldsFromRetrain(msg.custom_fields, 'custom', msg.predicted_fields, reverseObj(msg.custom_field_mapping))
                generateCustomFieldsFromRetrain(msg.dynamic_fields, 'dynamic', msg.predicted_fields, reverseObj(msg.dynamic_field_mapping))

                identifiers_arr = msg.document_identifiers ? msg.document_identifiers : []
                show_di_vals(identifiers_arr)

                customfields_arr = msg.custom_rule ? msg.custom_rule : []
                show_cfr_vals(customfields_arr)

                tst = ''
                var cnt = 1;

                fields_p = msg.predicted_fields;
                var count = 0;
                for (var i = 0; i < fields_p.length; i++) {
                    count = count + 1;
                    fields_p[i]["id"] = field_id_map[fields_p[i]["field"].replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')]
                    predicted_obj = fields_p[i];

                    if (!predicted_obj.display_name) {
                        console.log(predicted_obj);
                        var field____ = msg.display_name_mapping.find(x => x.unique_name === predicted_obj.field)
                        if (field____) {
                            console.log("is normal field");
                            predicted_obj.display_name = field____['display_name']
                        }
                        else {
                            field____ = msg.dynamic_field_mapping[predicted_obj.field];
                            if (field____) {
                                console.log("is dynamic field");
                                predicted_obj.display_name = field____
                            }
                            else {
                                field____ = msg.custom_field_mapping[predicted_obj.field];
                                if (field____) {
                                    console.log("is custom field");
                                    predicted_obj.display_name = field____
                                }
                                else {
                                    predicted_obj.display_name = predicted_obj.field 
                                    console.log("No field mapping found");
                                }
                            }
                        }
                    }
                    class_name = 'group_main';
                    pg = predicted_obj.coordinates.length > 0 ? predicted_obj.coordinates[0].page : 0
                    try {
                        val = predicted_obj.coordinates[0].word;
                    } catch (error) {
                        val = ''
                    }
                    textFields(i, predicted_obj);
                }

                $(".checkForce").removeClass('forSave')
                $(".checkForce").addClass('existinTemplates')
                $(".field_test_results").append("<div class='clear__'></div>");
                showTrainedTable(msg.trained_table)

                
            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
                loading(false);
            } else {
                loading(false);
                $.alert(msg.message, 'Alert');
            }
        }).fail(function () {
            $.alert('Something went wrong', 'Alert');
            loading(false);
        });
    }

    function generate_ft_predicted(all_fields, pd) {
        predicted_data = []
        for (i = 0; i < all_fields.length; i++) {
            idx = pd.findIndex(x => x.field === all_fields[i].unique_name)
            if (idx > -1) {
                predicted_data.push(pd[idx])
            } else {
                obj = {
                    coordinates: [],
                    field: all_fields[i].unique_name,
                    keycheck: true,
                    keyword: "",
                    method_used: "",
                    page: -1,
                    validation: "",
                    value: "",
                    trace: []
                }
                predicted_data.push(obj)
            }

        }
        generate_predicted_fields()
    }

    $("body").on("change", ".allQueues", function () {
        val = $(this).val();
        obj = {}
        obj.case_id = case_id;
        obj.queue = 'template_exceptions'
        obj.file_name = file_id;
        obj.queue_name = val
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
        loading(true);
        $.ajax(settings11).done(function (msg) {
            msg = JSON.parse(msg)
            loading(false);
            if (msg.flag) {
                $.alert(msg.message, 'Success');
                setTimeout(function () {
                    closePage()
                }, 1000);
            } else if ($.type(msg) == 'string') {
                $.alert('Something went wrong', 'Alert');
            } else {
                $.alert(msg.message, 'Alert');
            }
        }).fail(function () {
            $.alert('Something went wrong', 'Alert');
            loading(false);
        });

    })
    $("body").on("click", ".createNewTemplate", function () {
        $('.fields .head').addClass('bg-blue');
        if ($(".checkForce").hasClass('existinTemplates')) {
            $(".checkForce").removeClass('existinTemplates')
            $(".checkForce").addClass('forSave')
        }
        retrain = false
        showBtns('fields')
        $('.allFieldResults').show(500)
        $(".initial_view").hide(500)
        $(".secondary_view").show(500)
    })
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

    $("body").on("click", ".secondary_view .train_tab .head", function () {
        det_delete = false;
        nextClicked = true;
        noFiles = $(".imageCount").length;
        for (var i = 0; i < noFiles; i++) {
            $('#imageCountNum' + i).selectAreas('destroy');
        }
        type = $(this).parent().attr('type')
        showBtns(type)
        if (type === 'table') {
            $(".horizontal_line").remove();
            $(".vertical_line").remove();
            if (lines_data) {
                showLines(lines_data)
            }
        }
    })

    function loading(ef) {
        if (ef) {
            $(".loadmask").show();
        } else {
            $(".loadmask").hide();
        }
    }

    $('body').on('click', '.cropThis', function () {
        width_ = $(".imagesCountNum0").width();
        var obj = {
            onChanged: debugFooterAreas,
            onChanging: changingFooterAreas,
            width: width_,
            allowDelete: 'delete',
            addPlus: false,
            numbering: false,
        }
        createSelectAreas(obj)
    })

    $("body").on("keyup", ".searchFields", function () {
        val = $(this).val();

        $(".fieldTrain").filter(function () {
            $(this).toggle($(this).attr('filter').toLowerCase().indexOf(val) > -1)
        });
    })

    debugFooterAreas = function debugFooterAreas(event, id, areas) {
        setTimeout(() => {
            destroyAreas()
        }, 1000);
    }

    changingFooterAreas = function changingFooterAreas(event, id, areas) {
        ii = areas.findIndex(x => x.id == id);
        word = getWord(rte(areas[ii], $("#imageCountNum0").width()))
        $(".footerClass-" + clicked_table_name + " input").val(word)
    }


    $("body").on("click", ".add_d_i", function () {
        len = $(".di_group").length;
        t = '<div class="di_group di_group_' + len + ' ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" len="' + len + '">'
        t += '<div class="di_count">' + (len + 1) + '</div>'
        t += '<div class="di_btns">'
        t += '<div class="button" ty="(">(</div>'
        t += '<div class="button" ty=")">)</div>'
        t += '<div class="button" ty="ocr">Field</div>'
        t += '<div class="button" ty="meta">Meta Field</div>'
        t += '<div class="button" ty="condition">Condition</div>'
        t += '</div>'
        t += '<div class="di_formula_area">'
        t += '</div>'
        t += '<div class="drag_area ui-widget-header ui-corner-all">'
        t += '</div>'
        t += '<img src="images/trash.svg" class="delete_di_group">'
        t += '</div>'

        $(".all_di_groups").append(t)
        $(".all_di_groups").sortable({
            connectWith: ".column",
            handle: ".drag_area",
            containment: ".all_di_groups",
            update: function () {
                di_sort_update()
            }
        });
    })

    function di_sort_update() {
        $(".di_group").each(function (index) {
            $(this).find(".di_count").html(index + 1)
        });
    }

    $("body").on("click", ".delete_di_group", function () {
        $(this).closest('.di_group').remove();
    })

    $("body").on("click", ".di_btns .button", function () {
        ty = $(this).attr('ty');
        key_len = $(this).closest('.di_group').attr('len')
        j_length = $(this).closest('.di_group').find('.di_formula_area .di_box').length
        txt = di_template(ty, key_len, j_length, undefined, "di_")
        $(this).closest('.di_group').find('.di_formula_area').append(txt)
    })

    $("body").on("change", ".di_box select.di_drop", function () {
        value = $(this).val();
        value = value.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
        if ($(this).hasClass('field')) {
            idd = field_id_map[value];
            crps = field_areas_obj[idd + "-" + value]
            if (crps && crps.length > 0) {
                $(this).parent().find(".di_input").val(getWord(rte(crps[0], $("#imageCountNum0").width())))
            }
        } else if ($(this).hasClass('meta')) {
            $(this).parent().find(".di_input").val(meta_fields[value])
        }
        $(this).closest(".di_box").attr("value", value)
    })

    function show_cfr_vals(cfr_list) {
        for (let c_i = 0; c_i < cfr_list.length; c_i++) {
            t = '<div class="cfr_group cfr_group_' + c_i + ' ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" len="' + c_i + '">'
            t += '<div class="cfr_count">' + (c_i + 1) + '</div>'
            t += '<div class="cfr_btns">'
            t += '<div class="button" ty="(">(</div>'
            t += '<div class="button" ty=")">)</div>'
            t += '<div class="button" ty="ocr">Field</div>'
            t += '<div class="button" ty="custom">Custom Field</div>'
            t += '<div class="button" ty="equals">Equals</div>'
            t += '<div class="button" ty="operator">Operators</div>'
            t += '</div>'
            t += '<div class="cfr_formula_area">'
            if (cfr_list[c_i].template) {
                for (c_j = 0; c_j < cfr_list[c_i].template.length; c_j++) {
                    templ = cfr_list[c_i].template[c_j]
                    t += di_template(templ.type, c_i, c_j, templ, "cfr_")
                }
            }
            t += '</div>'
            t += '<img src="images/trash.svg" class="delete_cfr_group">'
            t += '</div>'

            $(".all_cfr_groups").append(t)
        }
    }

    function show_di_vals(di_list) {
        for (l_i = 0; l_i < di_list.length; l_i++) {
            t = '<div class="di_group di_group_' + l_i + ' ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" len="' + l_i + '">'
            t += '<div class="di_count">' + (l_i + 1) + '</div>'
            t += '<div class="di_btns">'
            t += '<div class="button" ty="(">(</div>'
            t += '<div class="button" ty=")">)</div>'
            t += '<div class="button" ty="ocr">Field</div>'
            t += '<div class="button" ty="meta">Meta Field</div>'
            t += '<div class="button" ty="condition">Condition</div>'
            t += '</div>'
            t += '<div class="di_formula_area">'
            if (di_list[l_i].template) {
                for (l_j = 0; l_j < di_list[l_i].template.length; l_j++) {
                    templ = di_list[l_i].template[l_j]
                    t += di_template(templ.type, l_i, l_j, templ, "di_")
                }
            }
            t += '</div>'
            t += '<div class="drag_area ui-widget-header ui-corner-all">'
            t += '</div>'
            t += '<img src="images/trash.svg" class="delete_di_group">'
            t += '</div>'
            $(".all_di_groups").append(t)
        }
        $(".all_di_groups").sortable({
            connectWith: ".column",
            handle: ".drag_area",
            containment: ".all_di_groups",
            update: function () {
                di_sort_update()
            }
        });
    }


    $("body").on("click", ".delete_di_box", function () {
        $(this).closest(".di_box").remove();
    })
    $("body").on("click", ".delete_cfr_box", function () {
        $(this).closest(".cfr_box").remove();
    })

    function di_template(ty, key, j, val = undefined, pre) {
        options_fields = forFields

        options_meta = Object.keys(meta_fields);

        v = ''
        q = ''
        if (ty === '(') {
            q += '('
            v += '('
        } else if (ty === ')') {
            q += ')'
            v += ')'
        } else if (ty === 'ocr') {
            q += '<select class="' + pre + 'select_show ' + pre + 'drop field">'
            q += '<option value="">Select Field</option>';
            for (i = 0; i < options_fields.length; i++) {
                selected = ''
                if (val && options_fields[i].value == val.field) {
                    selected = 'selected'
                    v = options_fields[i].value;
                }
                q += '<option value="' + options_fields[i].value + '" ' + selected + '>' + options_fields[i].name + '</option>'
            }
            q += '</select>'

            percents = [100, 95, 90, 85, 80, 75, 70, 60]

            q += '<select class="' + pre + 'select_show percentage">'
            for (i = 0; i < percents.length; i++) {
                selected = ''
                if (val && percents[i] == val.threshold) {
                    selected = 'selected'
                }
                q += '<option value="' + percents[i] + '" ' + selected + '>' + percents[i] + '%</option>';
            }
            q += '</select>'

            selected = ''
            if (val) {
                selected = val.text_value
            }
            q += '<input type="text" class="' + pre + 'input" value="' + selected + '">'
        } else if (ty === 'meta') {
            q += '<select class="' + pre + 'select_show ' + pre + 'drop meta">'
            q += '<option value="">Select Field</option>';
            for (i = 0; i < options_meta.length; i++) {
                selected = ''
                if (val && options_meta[i] == val.field) {
                    selected = 'selected'
                    v = options_meta[i];
                }
                q += '<option value="' + options_meta[i] + '" ' + selected + '>' + options_meta[i] + '</option>'
            }
            q += '</select>'
            percents = [100, 95, 90, 85, 80, 75, 70, 60]

            q += '<select class="' + pre + 'select_show percentage">'
            for (i = 0; i < percents.length; i++) {
                selected = ''
                if (val && percents[i] == val.threshold) {
                    selected = 'selected'
                }
                q += '<option value="' + percents[i] + '" ' + selected + '>' + percents[i] + '%</option>';
            }
            q += '</select>'
            selected = ''
            if (val) {
                selected = val.text_value
            }
            q += '<input type="text" class="' + pre + 'input" value="' + selected + '">'
        } else if (ty === 'condition') {
            conditions_list = [{
                name: "AND",
                value: "and"
            },
            {
                name: "OR",
                value: "or"
            },
            {
                name: "NOT",
                value: "not"
            }
            ]

            q += '<select class="' + pre + 'select_show ' + pre + 'drop condition">'
            for (i = 0; i < conditions_list.length; i++) {
                selected = ''
                if (val && conditions_list[i].value == val.condition) {
                    selected = 'selected'
                }
                q += '<option value="' + conditions_list[i].value + '" ' + selected + '>' + conditions_list[i].name + '</option>'
            }
            q += '</select>'
            v = (val && val.condition) ? val.condition : 'and'
        }
        else if (ty === 'equals') {
            equals_list = [{
                name: "Equal",
                value: "="
            }]

            q += '<select class="' + pre + 'select_show ' + pre + 'drop equals">'
            for (i = 0; i < equals_list.length; i++) {
                q += '<option value="' + equals_list[i].value + '" ' + selected + '>' + equals_list[i].name + '</option>'
            }
            q += '</select>'
            v = "="
        }
        else if (ty === 'operator') {
            operators_list = [{
                name: "Addition",
                value: "\+"
            }, {
                name: "Subtract",
                value: "\-"
            }, {
                name: "Multiply",
                value: "\*"
            }, {
                name: "Division",
                value: "\/"
            }]
            q += '<select class="' + pre + 'select_show ' + pre + 'drop operators">'
            for (i = 0; i < operators_list.length; i++) {
                selected = ''
                if (val && operators_list[i].value == val.condition) {
                    selected = 'selected'
                }
                q += '<option value="' + operators_list[i].value + '" ' + selected + '>' + operators_list[i].name + '</option>'
            }
            q += '</select>'
            v =  (val && val.operator) ? val.operator : '+'
        } else if (ty === 'custom') {
            q += '<select class="' + pre + 'select_show ' + pre + 'drop custom">'
            q += '<option value="">Select Custom Field</option>';
            for (i = 0; i < custom_fields_lists.length; i++) {
                selected = ''
                if (val && custom_fields_lists[i].field == val.field) {
                    selected = 'selected'
                    v = custom_fields_lists[i].field;
                }
                q += '<option value="' + custom_fields_lists[i].field + '" ' + selected + '>' + custom_fields_lists[i].field + '</option>'
            }
            q += '</select>'

            percents = [100, 95, 90, 85, 80, 75, 70, 60]

            q += '<select class="' + pre + 'select_show percentage">'
            for (i = 0; i < percents.length; i++) {
                selected = ''
                if (val && percents[i] == val.threshold) {
                    selected = 'selected'
                }
                q += '<option value="' + percents[i] + '" ' + selected + '>' + percents[i] + '%</option>';
            }
            q += '</select>'

            selected = ''
            if (val) {
                selected = val.text_value
            }
            q += '<input type="text" class="' + pre + 'input" value="' + selected + '">'
        } 

        t = '<div class="' + pre + 'box ' + pre + 'box_' + key + '_' + j + '" value="' + v + '" type="' + ty + '">'
        t += '<img class="delete_' + pre + 'box" src="images/close.svg">'
        t += q
        t += '</div>'

        return t
    }
    digi_current_page = 1;
    digi_total_pages = 1;

    $("body").on("click", ".close_digi_view p", function () {
        $(".image-box-view").show()
        $(".details-view").show()
        $(".digital-view").hide();
        $(".retrained-img-view").hide();
        $(".close_digi_view").hide();
        $(".imgs_here").html('')
    })
    $("body").on("click", ".un_map", function () {
        $(".image-box-view").show()
        $(".details-view").show()
        $(".digital-view").hide();
        $(".retrained-img-view").hide();
        $(".close_digi_view").hide();
        $(".imgs_here").html('')
    })
    $("body").on("click", ".show_digital", function () {
        //if($(".image_box_re.case_"+case_id).hasClass('active')) {
            $(".image-box-view").hide()
            $(".details-view").hide()
            $(".digital-view").show();
            $(".retrained-img-view").hide();
            $(".show_map_btn").hide();
            $(".close_digi_view").show()
            digi_current_page = 1
            digi_total_pages = imagesArr.length
            $(".digi_current_page").html(digi_current_page)
            $(".digi_total_pages").html(digi_total_pages)
            showBtns('')
            $(".train_tab .head").removeClass('bg-blue')
            // $(".image_box_re.case_"+case_id).click()
            show_image_digi(digi_current_page)
        //}
        //else {
            //$.alert('Select case id ' + case_id + ' to show digital view', 'Alert');
        //}
    })

    $("body").on("click", ".close_training", function() {
        closePage()
    })

    $("body").on("click", ".digi_back", function () {
        if (digi_current_page != 1) {
            digi_current_page -= 1
            $(".digi_current_page").html(digi_current_page)
            show_image_digi(digi_current_page)
        }
    })

    $("body").on("click", ".digi_next", function () {
        if (digi_current_page < digi_total_pages) {
            digi_current_page += 1
            $(".digi_current_page").html(digi_current_page)
            show_image_digi(digi_current_page)
        }
    })

    function show_image_digi(page) {
        $(".imgs_here").html('<img src="' + imagesArr[page - 1] + '" class="digi_image_view">')
        console.log(img_ocr_data[page - 1]);
        curr_page_ocr = img_ocr_data[page - 1]
        console.log(curr_page_ocr);

        currentWidth = $(".imgs_here").width();
        for (i = 0; i < curr_page_ocr.length; i++) {
            wd = resizeFactor(curr_page_ocr[i].width, currentWidth)
            ht = resizeFactor(curr_page_ocr[i].height, currentWidth)
            tp = resizeFactor(curr_page_ocr[i].top, currentWidth)
            lt = resizeFactor(curr_page_ocr[i].left, currentWidth)

            $(".imgs_here").append('<div title="' + curr_page_ocr[i].word + '" class="digi_ocr_box" style="width: ' + wd + 'px; height: ' + ht + 'px; top: ' + tp + 'px; left: ' + lt + 'px"></div>')
        }
    }

    present_mapping_id = 0;
    var trace_data = []

    $("body").on("click", ".show_map", function () {
        $(".more_options_screen").removeClass('open')
        present_mapping_id = 0;
        $('.footer_trace').show()
        $(".mapping_imags_here").html('');
        $(".image-box-view").hide()
        $(".details-view").hide()
        $(".retrained-img-view").hide();
        $(".mapping-view").show();

        for (let im_g = 0; im_g < imagesArr.length; im_g++) {
            $(".mapping_imags_here").append('<img class="full_width_img mapping_page_' + im_g + '" src="' + imagesArr[im_g] + '">')
        }
        var idx = predicted_data.findIndex(x => x.field === selectedBox)
        if (idx > -1) {
            trace_data = predicted_data[idx].trace ? predicted_data[idx].trace : [];
            if (trace_data.length == 0 || trace_data.length == 1) {
                $(".mapping_back").hide()
                $(".mapping_next").hide()
            }
            else {
                $(".mapping_back").hide()
                $(".mapping_next").show()
            }
            if (trace_data.length > 0) {
                show_trace(trace_data[present_mapping_id].coordinates)
            }
        }
    })

    function show_trace(dt) {
        $('.trace_values').html('')
        $(".map_crop").remove();
        currentWidth = $(".full_width_img").width()
        $('.tarce_values').html('');
        for (i = 0; i < dt.length; i++) {
            wd = resizeFactor(dt[i].width, currentWidth)
            ht = resizeFactor(dt[i].height, currentWidth)
            adj_top = 0;
            for (var p__i = 0; p__i < dt[i].page; p__i++) {
                adj_top += $('img.mapping_page_' + p__i).height();
            }
            tp = adj_top + resizeFactor(dt[i].top, currentWidth)
            lt = resizeFactor(dt[i].left, currentWidth)

            $('.mapping_imags_here').animate({ scrollTop: tp - 100 }, 1000);

            $(".mapping_imags_here").append('<div title="' + dt[i].word + '" class="map_crop" style="width: ' + wd + 'px; height: ' + ht + 'px; top: ' + tp + 'px; left: ' + lt + 'px"></div>')
            var bg_color = 'keyword';
            if (i == 0) {
                bg_color = 'value';
            }
            $('.tarce_values').append('<div data-length="' + i + '" class="sub_keywords_display_field pointer  ' + bg_color + '" title="' + bg_color.toUpperCase() + '" style="min-height: 15px;"><span class=""> ' + dt[i].word + ' </span>  <span class"matching">' + dt[i].matching_threshold + ' %</span></div>')
        }
    }

    $("body").on("click", ".mapping_next", function () {
        present_mapping_id += 1
        if (present_mapping_id == trace_data.length - 1) {
            $(".mapping_next").hide()
        }
        if (present_mapping_id < trace_data.length) {
            show_trace(trace_data[present_mapping_id].coordinates)
            $(".mapping_back").show()
        }
        else {
            $(".mapping_next").hide()
            $(".mapping_back").show()
            present_mapping_id -= 1
        }
    })

    $("body").on("click", ".mapping_close", function () {
        $(".mapping_imags_here").html('');
        $(".mapping-view").hide();
        $(".image-box-view").show()
        $(".details-view").show()
    })

    $("body").on("click", ".mapping_back", function () {
        present_mapping_id -= 1
        if (present_mapping_id == 0) {
            $(".mapping_back").hide()
        }
        if (present_mapping_id > -1) {
            $(".mapping_next").show()
            show_trace(trace_data[present_mapping_id].coordinates)
        }
        else {
            present_mapping_id += 1;
            $(".mapping_back").hide()
            $(".mapping_next").show()
        }
    })

    /*==========================================================================================*/
    /*========================================= Attributes View ================================*/
    /*==========================================================================================*/

    var else_count = 1;
    var selected_attribute_type;
    var selected_attribute_key;

    $("body").on("click", ".attributesView", function () {
        selected_attribute_key = $(this).data('length');
        if (!attr_field_data_obj[clicked_id + '-' + selectedBox]) {
            attr_field_data_obj[clicked_id + '-' + selectedBox] = {}
        }
        if (attr_field_data_obj[clicked_id + '-' + selectedBox][selected_attribute_key] && attr_field_data_obj[clicked_id + '-' + selectedBox][selected_attribute_key].type) {
            selected_attribute_type = attr_field_data_obj[clicked_id + '-' + selectedBox][selected_attribute_key].type
            create_attr_template('old')
        }
        $(".attribute_name_modal").show();
    })

    $("body").on("click", ".closeAttrBtn", function () {
        $(".selectedContent").html('')
        else_count = 1;
        $(".attribute_name_modal").hide();
    })

    $(".add_else").on('click', function () {
        e = '<div class="else_block block">'
        e += '<img src="images/trash.svg" class="delete_else">'
        e += '<div>'
        e += '<p>Else If</p>'
        e += '<div id="else' + else_count + 'builder"></div>'
        e += '</div>'
        e += '<div>'
        e += '<p>Else If then</p>'
        e += '<div id="elsethen' + else_count + 'builder"></div>'
        e += '</div>'
        e += '</div>'

        $(".all_else").append(e);
        $('#else' + else_count + 'builder').queryBuilder(attribute_options);
        $('#elsethen' + else_count + 'builder').queryBuilder(attribute_options);
        else_count += 1;
        $('.attribute_content .content').animate({ scrollTop: $('.attribute_content .content')[0].scrollHeight }, 1000);
    })

    $('.reset').on('click', function () {
        $('#ifbuilder').queryBuilder('reset');
        $('#ifthenbuilder').queryBuilder('reset');
        $('#else0builder').queryBuilder('reset');
        $('#elsethen0builder').queryBuilder('reset');

        for (let i = 0; i < else_count; i++) {
            if ($('#else' + else_count + 'builder').length > 0) {
                $('#else' + else_count + 'builder').queryBuilder('reset');
                $('#elsethen' + else_count + 'builder').queryBuilder('reset');
            }
        }
    });

    $("body").on("click", ".saveAttrBtn", function () {
        var attr_data;
        try {
            if (selected_attribute_type === 'simple') {
                attr_data = $('#simplebuilder').queryBuilder('getRules', {
                    get_flags: true,
                    skip_empty: true
                })
            } else {
                conditions_arr = []
                conditions_dict = {}
                conditions_dict['if'] = $('#ifbuilder').queryBuilder('getRules', {
                    get_flags: true,
                    skip_empty: true
                })
                conditions_dict['then'] = $('#ifthenbuilder').queryBuilder('getRules', {
                    get_flags: true,
                    skip_empty: true
                })
                conditions_arr.push(conditions_dict)

                conditions_dict = {}
                conditions_dict['if'] = $('#else0builder').queryBuilder('getRules', {
                    get_flags: true,
                    skip_empty: true
                })
                conditions_dict['then'] = $('#elsethen0builder').queryBuilder('getRules', {
                    get_flags: true,
                    skip_empty: true
                })
                conditions_arr.push(conditions_dict)

                for (i = 1; i < else_count; i++) {
                    conditions_dict = {}
                    conditions_dict['if'] = $('#else' + i + 'builder').queryBuilder('getRules', {
                        get_flags: true,
                        skip_empty: true
                    })
                    conditions_dict['then'] = $('#elsethen' + i + 'builder').queryBuilder('getRules', {
                        get_flags: true,
                        skip_empty: true
                    })
                    conditions_arr.push(conditions_dict)
                }

                attr_data = conditions_arr
            }
        } catch (error) {
            console.log(error);
        }
        if (attr_data) {
            attr_field_data_obj[clicked_id + '-' + selectedBox][selected_attribute_key] = {}
            attr_field_data_obj[clicked_id + '-' + selectedBox][selected_attribute_key].type = selected_attribute_type
            attr_field_data_obj[clicked_id + '-' + selectedBox][selected_attribute_key].rules = attr_data;
            $(".selectedContent").html('')
            $(".attribute_name_modal").hide();
            else_count = 1;
        }
    })

    $("body").on("click", ".selectAttrType", function () {
        var attr_data = $(this).data();
        selected_attribute_type = attr_data.type;
        attr_field_data_obj[clicked_id + '-' + selectedBox][selected_attribute_key] = {}
        display_created_attributes()
    })

    function create_attr_template(ct = 'new') {
        com = ''
        if (selected_attribute_type === 'simple') {
            com += '<div class="simple block">'
            com += '<div id="simplebuilder"></div>'
            com += '</div>'
        } else {
            com += '<div class="all_if block">'
            com += '<div>'
            com += '<p>If Block</p>'
            com += '<div id="ifbuilder"></div>'
            com += '</div>'
            com += '<div>'
            com += '<p>Then</p>'
            com += '<div id="ifthenbuilder"></div>'
            com += '</div>'
            com += '</div>'
            com += '<div class="all_else">'
            com += '<div class="else_block block">'
            com += '<div>'
            com += '<p>Else If</p>'
            com += '<div id="else0builder"></div>'
            com += '</div>'
            com += '<div>'
            com += '<p>Else If then</p>'
            com += '<div id="elsethen0builder"></div>'
            com += '</div>'
            com += '</div>'
            com += '</div>'
        }

        $(".selectedContent").html(com);
        if (ct == 'new') {
            try {
                if (selected_attribute_type === 'simple') {
                    $('#simplebuilder').queryBuilder(attribute_options);
                } else {
                    $('#ifbuilder').queryBuilder(attribute_options);
                    $('#ifthenbuilder').queryBuilder(attribute_options);
                    $('#else0builder').queryBuilder(attribute_options);
                    $('#elsethen0builder').queryBuilder(attribute_options);
                }
            } catch (error) {
                console.log(error);
            }
        }
        else {
            prev_rules = attr_field_data_obj[clicked_id + '-' + selectedBox]
            selected_attribute_type = prev_rules[selected_attribute_key].type;
            var opitons = attribute_options
            if (selected_attribute_type === 'simple') {
                opitons.rules = prev_rules[selected_attribute_key].rules ? prev_rules[selected_attribute_key].rules : {}
                $('#simplebuilder').queryBuilder(opitons);
            } else {
                all_rules = prev_rules[selected_attribute_key].rules ? prev_rules[selected_attribute_key].rules : []
                opitons = attribute_options;
                opitons.rules = all_rules[0].if
                $('#ifbuilder').queryBuilder(opitons);
                opitons.rules = all_rules[0].then
                $('#ifthenbuilder').queryBuilder(opitons);
                opitons.rules = all_rules[1].if
                $('#else0builder').queryBuilder(opitons);
                opitons.rules = all_rules[1].then
                $('#elsethen0builder').queryBuilder(opitons);
                if (all_rules.length > 2) {
                    for (let r_i = 2; r_i < all_rules.length; r_i++) {
                        e = '<div class="else_block block">'
                        e += '<img src="images/trash.svg" class="delete_else">'
                        e += '<div>'
                        e += '<p>Else If</p>'
                        e += '<div id="else' + else_count + 'builder"></div>'
                        e += '</div>'
                        e += '<div>'
                        e += '<p>Else If then</p>'
                        e += '<div id="elsethen' + else_count + 'builder"></div>'
                        e += '</div>'
                        e += '</div>'

                        $(".all_else").append(e);
                        else_count += 1;

                        rule_ = all_rules[r_i];
                        opitons.rules = rule_.if
                        $('#else' + (r_i - 1) + 'builder').queryBuilder(opitons);
                        opitons.rules = rule_.then
                        $('#elsethen' + (r_i - 1) + 'builder').queryBuilder(opitons);
                    }
                }
            }
        }
    }


    function display_created_attributes() {
        prev_rules = attr_field_data_obj[clicked_id + '-' + selectedBox]
        if (prev_rules && prev_rules[selected_attribute_key] && prev_rules[selected_attribute_key].type) {
            create_attr_template('old')
        }
        else {
            create_attr_template()
        }

        // $('#builder-basic').queryBuilder('setRules', rules_basic);
    }

    $("body").on("click", ".more_options", function () {
        if ($(".more_options_screen").hasClass('open')) {
            $(".more_options_screen").removeClass('open')
        } else {
            offset_top = $(this).offset().top
            offset_left = $(this).offset().left
            width = $(window).width()
            height = $(window).height()

            bottom = height - offset_top + 10
            right = width - offset_left - 30
            $(".more_options_screen").css({ "bottom": bottom, "right": right })
            $(".more_options_screen").addClass('open')
        }
    });

    $("body").on("click", ".show_other_templates", function () {
        if ($(".retrain_templates").hasClass('open')) {
            $(".retrain_templates").removeClass('open')
        }
        else {
            $(".retrain_templates").addClass('open')
        }
    })



    function show_retrain_templates(rt) {
        var cases = Object.values(rt);
        t = ''
        for (ri = 0; ri < cases.length; ri++) {
            cv_jpg_ = cases[ri].file_name.split('.')
            cv_jpg_.pop();
            cv_jpg = cv_jpg_.join('.');
            clss = ""
            if (cases[ri].case_id == case_id) {
                clss = "active"
            }

            t += '<div class="image_box_re pos_rl case_' + cases[ri].case_id + ' ' + clss + '" case_id="' + cases[ri].case_id + '"> \
                <img class="hadField" src="images/check.png">\
                <div class="re_temp" style="background-image: url(\'images/invoices/' + cv_jpg + '._0.jpg\')"></div> \
                <p>'+ cases[ri].case_id + '</p>\
            </div>'
            for (pi = 0; pi < predicted_data.length; pi++) {
                retrain_field_temp[predicted_data[pi].field] = retrain_field_temp[predicted_data[pi].field] ? retrain_field_temp[predicted_data[pi].field] : []
                for (const key in cases[ri].fields) {
                    if (cases[ri].fields[key].field === predicted_data[pi].field) {
                        retrain_field_temp[predicted_data[pi].field].push(cases[ri].case_id)
                        if (retrain_field_temp[predicted_data[pi].field].length > 0) {
                            $(".fieldTrain[field='" + predicted_data[pi].field + "']").addClass('retrained_field')
                            $(".retrain_count-" + predicted_data[pi].field).html(retrain_field_temp[predicted_data[pi].field].length)
                        }
                    }
                }
            }
        }
        $(".view_for_other_templates").html(t)

        console.log(retrain_field_temp);
    }

    function highlight_cases(lt) {
        $(".retrain_templates").addClass('open')
        for (let l = 0; l < lt.length; l++) {
            $(".case_" + lt[l]).addClass('activate')
        }
    }

    var case_fields
    $("body").on("click", ".image_box_re", function () {
        loading(true);
        $(".image_box_re").removeClass('active')
        $(".image_box_re").addClass('op5')
        $(this).removeClass('op5')
        $(this).addClass('active')
        $(".image-box-view").hide()
        $(".details-view").hide()
        $(".show_img_retrains").html('')
        $(".retrained-img-view").show()
        $(".retrain_values").html('')
        $(".delete_retrain_fields").hide()

        selected_case_id = $(this).attr('case_id');
        retrained_image = true;
        case_fields = new_retrain[selected_case_id].fields;

        var retrained_file = new_retrain[selected_case_id].file_name;

        splited_ = retrained_file.split('.');
        check_file = splited_[splited_.length - 1];
        logThis(6, [retrained_file, check_file]);
        if (check_file.toLowerCase() == 'pdf') {
            logThis(8, "Its a PDF file")
            previewPdfFile('images/invoices/' + retrained_file)
        } else if (check_file.toLowerCase() == 'tiff' || check_file.toLowerCase() == 'tif') {
            logThis(8, "Its a TIFF file")
            previewTiffFile('images/invoices/' + retrained_file)
        } else if (check_file.toLowerCase() == 'jpg' || check_file.toLowerCase() == 'jpeg' || check_file.toLowerCase() == 'png') {
            logThis(8, "Its a Image file")
            displayImage(['images/invoices/' + retrained_file])
        } else {
            logThis(8, "It is not a image file")
            $.alert('Invalid file name.', 'Alert');
        }
        setTimeout(() => {
            
        }, 3000);
    })

    function retrain_crops(cd, wddd) {
        wd = $(".retrainImageCount").width();
        $('.retrain_values').html('')
        $(".highlight_ret").remove();
        ref = wd / wddd;
        var top___ = 0;
        for (c = 0; c < cd.length; c++) {
            wd = cd[c].width * ref
            ht = cd[c].height * ref
            lf = cd[c].x * ref
            tp = cd[c].y * ref + get_retrain_top(cd[c].page);
            top___ = tp
            bg_color = c === 0 ? 'value' : 'keyword';
            $(".show_img_retrains").append('<div class="highlight_ret" style="top:' + tp + 'px; left:' + lf + 'px; width:' + wd + 'px; height:' + ht + 'px">')
            $('.retrain_values').append('<div class="sub_keywords_display_field ' + bg_color + '" title="' + bg_color.toUpperCase() + '"><span>' + cd[c].word + '</span> <span>' + cd[c].matching_threshold + '</span></div>')
        }
        $(".show_img_retrains").stop().animate({
            scrollTop: top___
        }, 500);
    }

    function get_retrain_top(pg) {
        t = 0;
        for (let p = 0; p < pg; p++) {
            t += $(".retrainImageCount" + p).height()
        }

        return t
    }

    $("body").on("click", ".delete_retrain_fields", function () {
        var r_case_id_ = $(this).attr('case_id');
        var r_field_id_ = $(this).attr('id');
        wrap_text_obj.removed_cases[selectedBox] = wrap_text_obj.removed_cases[selectedBox] ? wrap_text_obj.removed_cases[selectedBox] : []
        wrap_text_obj.removed_cases[selectedBox].push(r_case_id_)
        r_in = retrain_field_temp[selectedBox].indexOf(r_case_id_)
        retrain_field_temp[selectedBox].splice(r_in, 1);

        update_retrain_data_on_delete(r_case_id_, r_field_id_)
    })

    function update_retrain_data_on_delete(r_case_id_, r_field_id_) {
        $('.retrain_values').html('')
        $('.highlight_ret').remove()
        $(".delete_retrain_fields").hide();
        $(".case_" + r_case_id_).removeClass('activate');
        $(".retrain_count-" + selectedBox).html(retrain_field_temp[selectedBox].length)

        delete new_retrain[r_case_id_].fields[r_field_id_]
    }

    // function convertFieldstoPredicted(fields_list, predicted_list) {
    //     var listToSend = []
    //     for (let i = 0; i < fields_list.length; i++) {
    //         const element = fields_list[i];
    //         var index_predicted = predicted_list.findIndex(x => x.field == element);
    //         if (index_predicted > -1) {
    //             listToSend.push(predicted_list[index_predicted])
    //         }
    //         else {
    //             listToSend.push({
    //                 coordinates: [],
    //                 display_name: element,
    //                 field: element,
    //                 keycheck: true,
    //                 keyword: "",
    //                 page: 0,
    //                 validation: ""
    //             })
    //         }
    //     }

    //     return listToSend
    // }

    var custom_fields_lists = []
    
    $(".dynamic_field_modal").hide()
    $("body").on("click", ".add_dynamic_field", function() {
        $(".dynamic_field_modal").show()
    })

    $("body").on("click", ".close_dynamic_modal", function() {
        $(".dynamic_field_name").val("");
        $(".dynamic_field_modal").hide()
    })

    function generateCustomFieldsFromRetrain(cust_list, field_type, predicted, mapping) {
        for (let c_f_i = 0; c_f_i < cust_list.length; c_f_i++) {
            const element = cust_list[c_f_i];
            var p___index = predicted.find(x => x.field === mapping[element.field])
            
            if (p___index) {
                element.coordinates = []

                for (var j = 0; j < p___index['coordinates'].length; j++) {
                    page = p___index['coordinates'][j].page;
                    crop_cod = p___index['coordinates'][j];
                    width_ = $(".HorZOn").width();
                    obj = {}
                    obj = crop_cod
                    wd = resizeFactor(crop_cod.width, width_);
                    ht = resizeFactor(crop_cod.height, width_);
                    lf = resizeFactor(crop_cod.x, width_);
                    tp = resizeFactor(crop_cod.y, width_);
                    obj.width = wd > 9 ? (width_ > wd ? wd : 200) : 10;
                    obj.height = ht > 9 ? ht : 10;
                    obj.x = lf > 0 ? (lf > width_ ? 10 : lf) : 1;
                    obj.y = tp > 0 ? (tp > 2000 ? 10 : tp) : 20;
                    obj.type = j == 0 ? 'value' : 'keyword'
                    element.coordinates.push(obj)
                }
                element.keycheck = p___index.keycheck
                element.keyword = p___index.keyword
                element.method_used = p___index.method_used
                element.page = p___index.page
                element.validation = p___index.validation
                element.value = p___index.value
            }
            custom_fields_lists.push(element)
            addCustomFields('cust-'+ c_f_i, element.field, element, field_type)
        }
    }
    
    $("body").on("click", ".add_dy_field", function() {
        var dy_field_name = $(".dynamic_field_name").val();

        if ((/\s/).test(dy_field_name)) {
            $.alert('You are entering incorrect custom field name format. Correct format is <Use underscore instead of space>', 'Alert');
        }
        else {
            pr_object = {
                coordinates: [],
                display_name: dy_field_name,
                field: dy_field_name,
                keycheck: true,
                keyword: "",
                page: 0,
                validation: ""
            }
            custom_fields_lists.push(pr_object)
    
            addCustomFields('cust-'+ custom_fields_lists.length, dy_field_name, pr_object, 'custom')
            $(".dynamic_field_name").val("");
            $(".dynamic_field_modal").hide();
    
            $(".displayresults").animate({ scrollTop: $(".group_main").height() }, 1000);
        }

    })

    function addCustomFields(id, field_name, predicted_obj, field_type) {
        kywd = field_name.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
        filter_value = kywd.replace(/_/g, ' ');
        kp = ''
        if (trained_fields.indexOf(field_name) > -1) {
            kp += '<img src="images/check.png" class="keyword_check_img">'
        } else {
            value = ''
        }

        field_areas_obj[id + "-" + kywd] = predicted_obj.coordinates || []

        field_id_map[kywd] = id;

        tr = '<div class="fieldTrain custom_field pos_rl  recd-' + id + '-' + kywd + '" field_type="' + field_type + '" id="' + id + '" filter="' + filter_value + '"  value="" field="' + field_name + '" split="no" target="' + kywd + '" ty="new">'


        tr += '<span class="custom_field_check">' + (field_type === 'custom' ? 'C' : 'D') + '</span>'
        tr += '<div class="fieldValid-' + id + '-' + kywd + '">'
        var str = predicted_obj.display_name ? predicted_obj.display_name : field_name
        var res = str.substring(0, 15);
        tr += '<span class="retrain_count retrain_count-' + kywd + '"></span>'
        tr += '<p first="yes" group="' + kywd + '" class="mods_inputs keywordSelect keyword-' + id + '-' + kywd + ' pointer" title="' + str + '" field="' + field_name + '">' + res.replace(/_/g, ' ') + '</p>'
        tr += kp
        tr += '</div>'
        tr += '</div>'
        $(".group_main").append(tr);
    }




    $("body").on("click", ".add_cfr", function () {
        len = $(".cfr_group").length;
        t = '<div class="cfr_group cfr_group_' + len + ' ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" len="' + len + '">'
        t += '<div class="cfr_count">' + (len + 1) + '</div>'
        t += '<div class="cfr_btns">'
        t += '<div class="button" ty="(">(</div>'
        t += '<div class="button" ty=")">)</div>'
        t += '<div class="button" ty="ocr">Field</div>'
        t += '<div class="button" ty="custom">Custom Field</div>'
        t += '<div class="button" ty="equals">Equals</div>'
        t += '<div class="button" ty="operator">Operators</div>'
        t += '</div>'
        t += '<div class="cfr_formula_area">'
        t += '</div>'
        t += '<img src="images/trash.svg" class="delete_cfr_group">'
        t += '</div>'

        $(".all_cfr_groups").append(t)
    })

    $("body").on("click", ".cfr_btns .button", function () {
        ty = $(this).attr('ty');
        key_len = $(this).closest('.cfr_group').attr('len')
        j_length = $(this).closest('.cfr_group').find('.cfr_formula_area .di_box').length
        txt = di_template(ty, key_len, j_length, undefined, "cfr_")
        $(this).closest('.cfr_group').find('.cfr_formula_area').append(txt)
    })

    $("body").on("change", ".cfr_box select.cfr_drop", function () {
        value = $(this).val();
        value = value.replace(/[ |\/|\(|\|\>|\<|\=|\.|\,)]/g, '_')
        if ($(this).hasClass('field') || $(this).hasClass('custom')) {
            idd = field_id_map[value];
            crps = field_areas_obj[idd + "-" + value]
            if (crps && crps.length > 0) {
                $(this).parent().find(".cfr_input").val(getWord(rte(crps[0], $("#imageCountNum0").width())))
            }
        }
        $(this).closest(".cfr_box").attr("value", value)
    })

    $("body").on("click", ".delete_cfr_group", function () {
        $(this).closest('.cfr_group').remove();
    })
})
