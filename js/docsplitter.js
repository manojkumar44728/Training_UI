$(document).ready(function () {
   // Json Data Tab
   let originUrl = window.location.href
   let store_pg 
   //console.log(originUrl)
   var dpi_page;
   var tabs = $('.tabs');
   var container = $('.container');
   var file_id = decodeURIComponent(getUrlParameter('file_name'));
   var case_id = decodeURIComponent(getUrlParameter('case_id'));
   var retrain = getUrlParameter('retrain');
   var user_name = decodeURIComponent(getUrlParameter('user'));
   var template_name_retrain = decodeURIComponent(getUrlParameter('template'));
   var tenant_id = getUrlParameter('host_name');
   var splitter = getUrlParameter('splitter');
   localStorage.removeItem("splitter")
   localStorage.setItem("splitter" ,splitter )
   
   $(".upload_model").hide()
  var imagefiles_ = []
   file_id = file_id ? file_id : ''
   retrain = nullCheck(retrain) ? (retrain == 'true' ? true : false) : false
    originUrl = window.location.origin.split(':');
    dynamicUrl = originUrl[0] + ":" + originUrl[1] + ":5002";

   // dynamicUrl = "http://13.235.149.56:5002"
   let selected_Item
   pageLoad()
   let store_default_file_images = []
   img_ocr_data  = []
   function pageLoad() {

      loading(true)

      sendObj = {}
      sendObj.file_name = file_id;
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id
      // if (retrain) {
      //    sendObj.template_name = template_name_retrain.replace(/%20/g, " ");
      // }
      settings11 = {
         "async": true,
         "crossDomain": true,
         "url": dynamicUrl + "/file_paths",
         "method": "POST",
         "processData": false,
         "contentType": "application/json",
         "data": JSON.stringify(sendObj)
      };

      $.ajax(settings11).done(function (msg) {
         // msg ={"data":[{"fileName":"RE-2017.23202.pdf","filePath":"/var/www/training_api/app/files/ace/assets/pdf/acepoc3/ACECF7169C/RE-2017.23202.pdf"},
         // {"fileName":"113. Sodexo_CLIENT_INVOICE_2169768.pdf","filePath":"/var/www/training_api/app/files/ace/assets/pdf/acepoc3/ACECF7169C/RE-2017.23202.pdf"}],"flag":true}
         loading(false)
         msg = JSON.parse(msg)
         store_default_file_images = msg.data
         img_ocr_data = msg.ocr_data
         getTabs(msg.data)
         getGroupInfo()
      })

   }

   $(".gp_sub").hide()
   function getGroupInfo(){
      sendObj = {}
      sendObj.FileName = file_id;
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      settings11 = {
         "async": true,
         "crossDomain": true,
         "url": dynamicUrl + "/split_screen_loader",
         "method": "POST",
         "processData": false,
         "contentType": "application/json",
         "data": JSON.stringify(sendObj)
      };
      $.ajax(settings11).done(function (msg) {
         loading(false)
         msg = JSON.parse(msg)
         if(msg.flag){
            showDefaultdata(msg)
            let grouped_dropdown = msg.data
            for (let i = 0; i < grouped_dropdown.length; i++) {
               for (const key in grouped_dropdown[i]) {
                  if(grouped_dropdown[i][key].length > 0){
                     $(".gp_sub").show()
                  }
               }
            }
           
         }
         })
   }


   $(".save_screen").hide()
  

   function getTabs(data) {
      let file_name
      let findindex
      var html_tabs = '';
      var html_content = '';
      for (let index = 0; index < data.length; index++) {
         html_tabs += '<li><a '
         html_tabs += 'href="#tab' + index + '" name="'+data[index].fileName+'"   filePath ="' + data[index].filePath + '" index='+index+'    >' + data[index].fileName + '</a></li>';
         html_content += '<div id="tab' + index + '" class="parent_content">';
         html_content += ' <div class="showbigDoc">'
         html_content += '   <img src="images/trash.png" title=""  class="delete_lines" style="display:none;"  index='+index+' />'
         //html_content += '   <img src="images/split_screen.png" title="To Split File - If single page , click on this icon. If multi page double click on page where to start & end"  class="split_page" index='+index+' />'
         html_content += '   <img src="images/save.png"  class="save_screen" />'
         html_content += ' <div class="viewPdf">'
         html_content += ' <div id="showpdf' + index + '" class="showpdf showpdf' + index + '">'
         html_content += '</div>'
         html_content += ' </div>'
         html_content += ' </div>'
         html_content += ' <div class="showpage"></div>'
         html_content += '  <div class="vl">'
         html_content += '  </div>'
         html_content += '   <div class="showSmallDoc"><div class="small_img small_img'+index+'"></div>'
         html_content += '  </div>'
         html_content += '   </div>'
      }
      let showfirstFile = 'pdf/' + data[0].fileName + ''
      // previewPdfFile(showfirstFile ,0)
      tabs.html(html_tabs);
      container.html(html_content);
      calltabs()
   }



   // Looping links
   function calltabs() {
      $.each($('.tabs li a'), function (count, item) {
         // Set on click handler
         $(".tabs li a").on('click', function () {
            // Hide all div content
            container.find('div').removeClass('active');
            var current = $(this).attr('href');
            // Remove active class on links
            $('.tabs li a').removeClass('active');
            // Set active class on current and ul parent
            $(this).addClass('active');
            $(this).parents('ul').find('li').removeClass('active');
            $(this).parent().addClass('active');
            // Show current container
            $(current).addClass('active');
         });
      }).eq(0).click().addClass('active');
   }

   $("body").on("click", ".tabs li a", function () {
      file_id = $(this).attr("name")
      $(".horizontal_line").remove()
      let file_name = $(this).attr("filePath")
      let findindex = $(this).attr("index")
      // previewPdfFile(file_name ,findindex)
      var num = Math.random();
      for (let f_p = 0; f_p < store_default_file_images.length; f_p++) {
           if(file_id == store_default_file_images[f_p].fileName){
            file_pgs = []
               for (let store_fp = 0; store_fp < store_default_file_images[f_p].file_pages[file_id].length; store_fp++) {
                  file_pgs.push('images/invoices/' + tenant_id + '/' + case_id + '/images/' + store_default_file_images[f_p].file_pages[file_id][store_fp] + "?v=" + num);
               }
           }
      }
      console.log(file_pgs)
      displayImage(file_pgs ,findindex)
   })



   $("body").on("click", ".open_panel", function () {
      let testarray = document.getElementsByClassName("panel-wrap")
      $(".panel").css("display", "block")
      for (var i = 0; i < testarray.length; i++) {
         testarray[i].className += " paneclicked";
      }
   })

   $("body").on("click", ".close_btn", function () {
      $(".panel").css("display", "none")
      let testarray = document.getElementsByClassName("panel-wrap")
      for (var i = 0; i < testarray.length; i++) {
         testarray[i].classList.remove("paneclicked");
      }
   })

   //pdf to image
   function previewPdfFile(file, index ,fileViewType) {
      console.log("previewPdfFile called")
      loadXHR(file, index).then(function (blob) {
         var reader = new FileReader();
         reader.onload = function (e) {
            pdftoimg(e.target.result, index ,fileViewType)
         }
         reader.readAsDataURL(blob);
      });
   }

   function loadXHR(url, index) {
      console.log("loadxhr called")
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

   function pdftoimg(file, index ,fileViewType) {
      console.log("pdftoimg called")
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
                  //console.log(imagesArr)
                  displayImage(imagesArr, index ,fileViewType)
                  console.log("images" ,imagesArr)
               }
            }
         };
         go();
      }, function (error) {
         loading(false);
         $.alert('Something went wrong', 'Error');
      });
   }
   let store_images;
   onPage = 1;
   function displayImage(imagefiles, index ,fileViewType) {

      store_images = imagefiles
      // pageNo(imagefiles)
      console.log(imagefiles, index ,"displyaImage")
      if(fileViewType == "smallFile"){
         img__ = ''
         imagefiles_ = imagefiles;
         for (var i = 0; i < imagefiles.length; i++) {
            img__ += '<img src="' + imagefiles[i] + '"   width="100%"></div> ';
         }
         $(".small_img" + index).empty()
         $(".small_img" + index).html(img__)
         $(".small_img").append(' <img src="images/arrow-right.png"  class="open_panel" />')
         $(".small_img").append('<div class="display_pg">Page No : '+store_pg[0]+' - '+store_pg[1]+'</div>')
      }
      else{
         img__ = ''
         imagefiles_ = imagefiles;
         for (var i = 0; i < imagefiles.length; i++) {
            img__ += '<img src="' + imagefiles[i] + '" id="imageCountNum' + i + '" class="imageCount imageCountNum' + i + '" alt="' + i + '"  width="100%"> <div id="info"></div></div> ';
         }
         $(".showpdf" + index).empty()
         $(".showpdf" + index).html(img__)
         // $(".showpdf" + index).append('<p class="page_no_view">'+onPage+' of '+store_images.length+'</p>')
   
      }
   }
   // onPage = 1
   // $(".showbigDoc").wheel(function() {

   //    console.log("Event Fired")

   // })

   // $(".showbigDoc").bind('scroll', function(e) {
   //    let pageHeight = 0;
   //    let pageStart = 0;
   //    let scrollVal = e.target.scrollTop + 100;
  
   //    for (let page = 0; page < this.store_images.length; page++) {
   //      pageHeight += document.getElementById("imageCountNum" + page).offsetHeight
   //      if (pageHeight >= scrollVal && pageStart <= scrollVal) {
   //        this.onPage = page + 1
   //        break
   //      }
   //      else {
   //        pageStart = pageHeight
   //      }
   //    }

   // })


   //add hor lines 
   let delete_clicked = false
   $("body").on("click", ".delete_lines", function () {
      $(".horizontal_line").remove()
      $(this).hide()
      delete_clicked =! delete_clicked
   })


   
   $("body").on("click", ".split_page", function () {
      $(".delete_lines").show()

      $(".horizontal_line").remove()
      let index = $(this).attr("index")
      // var img = document.getElementsByClassName('imageCount');
      let img = $('.showpdf'+ index+' img')
      // var img =  $('.showpdf'+ getindex+' img')
         var width = img[0].clientWidth;
         var height = img[0].clientHeight;
         var top = img[0].offsetTop
         var left = img[0].offsetLeft
         hors = [{
            "color": "blue",
            "height": 15,
            "page": 0,
            "width": width,
            "x": left,
            "top": top,
            "text":"begin"
         }, {
            "color": "blue",
            "height": 15,
            "page": 0,
            "width": width,
            "x": left,
            "top": top + 60,
            "text":"end"
   
         }]
         $(".save_screen").show()
   
         for (var i = 0; i < hors.length; i++) {
            drawHorLines(hors[i], i)
         }
   })




   function drawHorLines(points, i) {
      delll = ''
      $(".showpdf").append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line' + i + '" color="' + points.color + '" page="' + points.page + '" id="' + i + '" style="top: ' + (points.top) + 'px;left: ' + points.x + 'px; height: ' + (points.height + 14) + 'px; width: ' + points.width + 'px;"><div class="hor_line" style="background: ' + points.color + '">' + delll + '<span class="span_text">'+points.text+'</span> </div></div>');
      $(".horizontal_line").draggable({});
      return '';
   }



   function adjtop(id) {
      adj_top = 0;
      for (var i = 0; i < id; i++) {
         adj_top += $('img.imageCountNum' + i).height();
      }
      return adj_top
   }

   $("body").on("click", ".del_hor", function () {
      $(this).parent().parent().remove();
   });

   lines_return = []
   $(".template_name_modal").hide();

   $("body").on("click", ".save_screen", function () {
      $(".template_name_val").val('')
      $(".template_name_modal").show();


   })
   let stored_template_name
   let storedInfo
   $("body").on("click", ".saveBtn", function () {
      // loading(true);
      lines_return = []
      $(".template_name_modal").hide();
      let index_1 = $(".tabs li a.active").attr("index")
      let hors = $('.showpdf'+index_1+' .horizontal_line')
      stylesarr = []
      storePages = []
      for (var i = 0; i < hors.length; i++) {
         var result = {}
         new_attr = hors[i].attributes.style.value.split(';');
         for (var j = 0; j < new_attr.length; j++) {
            var entry = new_attr[j].split(':');
            let k = $.trim(entry[0])
            let v = $.trim(entry[1]).replace(/px/g,"")
            if (k.length > 0 && v.length > 0)
            {
            result[k] = v
            }
            result['page'] = parseInt(hors[i].attributes.page.value);
         }
           storePages.push(parseInt(hors[i].attributes.page.value));
          lines_return.push(result)
      }
      let name = $(".template_name_val").val();
      stored_template_name = name
      
      sendObj = {}
      sendObj.FileName = file_id;
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.templateName = name;
      sendObj.coordinates = lines_return
      settings11 = {
         "async": true,
         "crossDomain": true,
         "url": dynamicUrl + "/get_grouped_dropdown",
         "method": "POST",
         "processData": false,
         "contentType": "application/json",
         "data": JSON.stringify(sendObj)
      };

      $.ajax(settings11).done(function (msg) {
      loading(false)
      msg = JSON.parse(msg)
      if (msg.flag) {
         showDefaultdata(msg)
         // $(".template_name_val").val("");
        
        }
      })

   })

   function displaySmallImages(imagefiles){
      img__ = ''
      imagefiles_ = imagefiles;
      for (var i = 0; i < imagefiles.length; i++) {
         img__ += '<img src="' + imagefiles[i] + '"   width="100%"></div> ';
      }
      $(".small_img").empty()
      $(".small_img").html(img__)
      $(".small_img").append(' <img src="images/arrow-right.png"  class="open_panel" />')
      // $(".small_img").append('<div class="display_pg">Page No : '+store_pg[0]+' - '+store_pg[1]+'</div>')
   }

    function showDefaultdata(msg){
      
      selected_Item = stored_template_name
      $(".horizontal_line").remove()
      let grouped_dropdown = msg.data
      storedInfo = msg.data
      if(msg.template_list && msg.template_list.length > 0){
      displayTemplateOptions(msg.template_list)
      }
      localStorage.removeItem("Grouped_Info")
      localStorage.setItem("Grouped_Info", JSON.stringify(storedInfo))
      let gd = ''
      $("#crusttype").val("")
      $("#mandatory").prop("checked", false)
      $('input[name="pg"]').attr('checked', false);
      $("#crop").prop("checked", false)
      gd +='<option value="select template ">select template</option>'
      for (let i = 0; i < grouped_dropdown.length; i++) {
         const element = grouped_dropdown[i];
         for (const key in grouped_dropdown[i]) {
            gd += '<optgroup label="' + key + '" class="bg_doc">'
            for (let j = 0; j < grouped_dropdown[i][key].length; j++) {
               var sel = ''
               store_pg = []
               // stored_template_name = stored_template_name ? stored_template_name :grouped_dropdown[i][key][0].SplittedScreenName
               if (stored_template_name == grouped_dropdown[i][key][j].SplittedScreenName) {
                  for (var ii = 0; ii < grouped_dropdown[i][key][j].coordinates.length; ii++) {
                     store_pg.push(grouped_dropdown[i][key][j].coordinates[ii]["page"])
                  }
                  storesubimages = []
                  $(".gp_sub").show()
                  $(".small_img").html('')
                  console.log(store_images)
                  for (let pg = store_pg[0]; pg < store_pg[1] +1 ; pg++) {
                     let small_img = store_images[pg]
                     if(storesubimages.includes(small_img)){
                     }
                     else{
                        storesubimages.push(small_img)
                     }
                  }
                   displaySmallImages(storesubimages)
                  // let split_file =  grouped_dropdown[i][key][j].SplittedFile
                  // let split_file_path =  grouped_dropdown[i][key][j].SplittedFilePath
                  // previewPdfFile(split_file_path ,"" , "smallFile")
                  sel = 'selected'
                  $("#crusttype").val("")
                  $("#mandatory").prop("checked", false)
                  $('input[name="pg"]').attr('checked', false);
                  $("#crop").prop("checked", false)
                  if(grouped_dropdown[i][key][j].properties){
                     updateProps(grouped_dropdown[i][key][j].properties)
                  }
               }
               storeCoords = grouped_dropdown[i][key][j].SplittedScreenName
              
               gd += '<option ' + sel + '   type="'+grouped_dropdown[i][key][j].properties.templateType+'"  value = "' + grouped_dropdown[i][key][j].SplittedScreenName + '">' + grouped_dropdown[i][key][j].SplittedScreenName + '</option>'
            }
            gd += '</optgroup>'
         }
      }
      $(".gp_sub").empty()
      $(".gp_sub").append(gd)
     
    }


    function displayTemplateOptions(template_list){
      
         let addopt = ''
         let options = template_list
         for (let opt = 0; opt < options.length; opt++) {
            addopt += '<option value="'+options[opt]+'" >'+options[opt]+'</option>'
         }
         $("#template_type").empty()
         $("#template_type").append(addopt)
         $("#crusttype").empty()
         $("#crusttype").append(addopt)
    }
    
 $("#doc_id").hide();

   $("body").on("change", "#crusttype", function (event) {
      loading(true);
      console.log(storedInfo)
      var opt = $(this).find(':selected');
      var sel = opt.text();
      selected_Item = sel
      sendObj = {}
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.fileName = file_id;
      sendObj.templateType = sel
      settings11 = {
         "async": true,
         "crossDomain": true,
         "url": dynamicUrl + "/get_type_identifiers",
         "method": "POST",
         "processData": false,
         "contentType": "application/json",
         "data": JSON.stringify(sendObj)
      };

      $.ajax(settings11).done(function (msg) {
         msg = JSON.parse(msg)
         loading(false);
         if (msg.flag) {
         // $("#crusttype").val("")
            $("#doc_id").show();
            let doc_i = msg.data
            display_DI(doc_i)
         }
         else{
            $("#doc_id").show();
            $("#doc_id").html("No Document Identifiers found");
         }
         })
   })


   let store_redirect_top
   $(".template_name_list").hide()

  
   $("body").on("change", ".gp_sub", function (event) {

      loading(true);
      console.log(storedInfo)
      var opt = $(this).find(':selected');
      var sel = opt.text();
      stored_template_name = sel
      localStorage.removeItem("selected_Item")
      localStorage.setItem("selected_Item" ,sel)
      var og = opt.closest('optgroup').attr('label');
      var file_type = opt[0].attributes.type.value;
      console.log(sel, og)
      selected_Item = sel
      sendObj = {}
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.fileName = og;
      sendObj.splitFileName = sel;
      sendObj.file_type = file_type
         
      settings11 = {
         "async": true,
         "crossDomain": true,
         "url": dynamicUrl + "/combinelinecoandprop",
         "method": "POST",
         "processData": false,
         "contentType": "application/json",
         "data": JSON.stringify(sendObj)
      };

      $.ajax(settings11).done(function (msg) {
         msg = JSON.parse(msg)
         loading(false);
         if (msg.flag) {
         $("#crusttype").val("")
         if(msg.template_list && msg.template_list.length > 0){
            displayTemplateOptions(msg.template_list)
         }
         if(msg.trained_template_list && msg.trained_template_list.length  > 0){
            $(".template_name_list").show()
            displayTemplateDropdowns(msg.trained_template_list ,msg.detected_template[0])
         }

         $("#mandatory").prop("checked", false)
         $('input[name="pg"]').attr('checked', false);
         $("#crop").prop("checked", false)
         $(".horizontal_line").remove()
        
         let group_info = msg.data
         for (let i = 0; i < group_info.length; i++) {
            if (group_info[i].SplittedScreenName == sel) {
               // $(".small_img").html('')
               // $(".small_img").append(' <img src="images/arrow-right.png"  class="open_panel" />')
               if(group_info[i].properties){
                  updateProps(group_info[i].properties)
               }
               let text = ["begin" ,"end"]
               $(".horizontal_line").remove()
               store_pg = []
               for (var ii = 0; ii < group_info[i].coordinates.length; ii++) {
                  store_redirect_top = group_info[i].coordinates[0]["top"]
                  store_pg.push(group_info[i].coordinates[ii]["page"])
                  delll = ''
                  $(".showpdf").append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line' + ii + '" color="blue" id="' + ii + '" style="top: ' + group_info[i].coordinates[ii]["top"] + 'px; height:'+group_info[i].coordinates[ii]["height"]+'px; width: '+group_info[i].coordinates[ii]["width"]+'px;"><div class="hor_line" style="background:blue">' + delll + '<span class="span_text">'+text[ii]+'</span> </div></div>');
                  // $(".horizontal_line").draggable({});
                 
               }
               storesubimages = []
               console.log(store_images)
               for (let pg = store_pg[0]; pg < store_pg[1] +1 ; pg++) {
                  let small_img = store_images[pg]
                  if(storesubimages.includes(small_img)){
                  }
                  else{
                     storesubimages.push(small_img)
                  }
               }
               
                displaySmallImages(storesubimages)
               // previewPdfFile(group_info[i].SplittedFilePath ,"" , "smallFile")
            }
         }
         $(".showbigDoc").scrollTop(store_redirect_top)
         }
      })

   })


   
   $("body").on("click", ".prop_save", function () {
     
      loading(true);
      let templateType = $("#crusttype").val()
      let mandatory = $("#mandatory").prop("checked")
      let PO = $('input[name="pg"]:checked').val();
      let crop = $("#crop").prop("checked");
      let universal = $("#universal").prop("checked");
      localStorage.setItem("stored_template_type" ,templateType)
      //begin getting doc identifiers
      doc_array = []
      let doc_length = $(".field_type").length
      for (let i = 0; i < doc_length; i++) {
         let name = $(".displayValue"+i).attr("name")
         let a =$(".displayValue"+i).val()
         let obj = {}
         obj[name] = a
         doc_array.push(obj)
      }
      totalobj = []
      let parent = $(".field_type").length
      for (let j = 0; j < parent; j++) {
         let child = document.getElementById('field_type'+j).options;
         optionsList = []
         let obj = {}
         for (let k = 0; k < child.length; k++) {
            let opt = child[k].value
            optionsList.push(opt)
            let name = $(".displayValue"+j).attr("name")
            obj[name] = optionsList
         }
         totalobj.push(obj)
      }
      // end
      sendObj = {}
      sendObj.fileName = file_id;
      sendObj.SPlittedName= stored_template_name
      sendObj.templateName= stored_template_name
      sendObj.universal = universal
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.templateType = templateType;
      sendObj.Mandatory = mandatory;
      sendObj.Crop = crop;
      sendObj.PageOrientation = PO
      // "PageOrientation" : "portrait",
      sendObj.DocumentIdentifiers = doc_array
      sendObj[templateType] = totalobj
      settings11 = {
         "async": true,
         "crossDomain": true,
         "url": dynamicUrl + "/save_properties",
         "method": "POST",
         "processData": false,
         "contentType": "application/json",
         "data": JSON.stringify(sendObj)
      };

      $.ajax(settings11).done(function (msg) {
         msg = JSON.parse(msg)
         loading(false);
         $(".horizontal_line").remove()
         $(".panel").css("display", "none")
         let testarray = document.getElementsByClassName("panel-wrap")
         for (var i = 0; i < testarray.length; i++) {
            testarray[i].classList.remove("paneclicked");
         }
         // if(msg.flag){
         //    $.alert("Properties Saved Successfully", 'Alert');
         // }
      })

   })


   let stored_template_type;
   function updateProps(data) {
      if(data){

         console.log(data)
         stored_template_type = data.templateType
         localStorage.setItem("stored_template_type" ,stored_template_type)
         $("#your_name").val(data.templateName)
         $("#crusttype").val(data.templateType)
         $("#mandatory").prop("checked", data.Mandatory)
         $('input[name="pg"][value="'+data.PageOrientation+'"]').attr('checked', true);
         $("#crop").prop("checked", data.Crop)
      }
   }


   $("body").on("click", ".closeTempModal", function () {
      $(".template_name_val").val('');
      $(".template_name_modal").hide();
   })

   $(".display_tt").hide()

   $('input[type=radio][name=dt]').change(function() {
      if (this.value == 'Single Template') {
         $(".display_tt").show()
      }
      else{
         $(".display_tt").hide()
      }
  });

   
   $("body").on("click", ".Upload", function () {
      $(".upload_model").show()
   })

   $("body").on("click", ".Upload_file", function () {
       $(".file_upload").click()
   })
   

   $("body").on("change", ".fileUpload", function () {
      sendObj = {}
      var file = $(this)[0].files[0];
      let fileName = file['name'];
      if($('input[name="pg"]:checked').val() == 'Single Template'){
         var fileReader = new FileReader();
         fileReader.onloadend = function (e) {
            blob___ = e.target.result;
            sendObj.FileName = fileName;
            sendObj.Blob = blob___;
            sendObj.case_id = case_id;
            sendObj.tenant_id = tenant_id;
            sendObj.selected_file_type =  $('input[name="pg"]:checked').val();
            settings11 = {
               "async": true,
               "crossDomain": true,
               "url": dynamicUrl + "/upload_files",
               "method": "POST",
               "processData": false,
               "contentType": "application/json",
               "data": JSON.stringify(sendObj)
            };
   
            $.ajax(settings11).done(function (msg) {
               msg = JSON.parse(msg)
               getTabs(msg.data)
            })
         }
         fileReader.readAsDataURL(file);
      }
      else{
         let files = ''
         files  +=     '<div class="display_tt">'
         files  +=     '<label for="template_type">Choose Template Type</label>'
         files  +=     '<select id="template_type" name="template_type">'
         files  +=     ' <option value="PDCC">PDCC</option>'
         files  +=     '<option value="HPA">HPA</option>'
         files  +=     ' <option value="Tax Doc">Tax Doc</option>'
         files  +=     '<option value="Invoice">Invoice</option>'
         files  +=     ' <option value="Insurance">Insurance</option>'
         files  +=     ' <option value="Enquiry O/D">Enquiry O/D</option>'
         files  +=     ' <option value="VOC">VOC</option>'
         files  +=     ' <option value="DDR">DDR</option>'
         files  +=     ' <option value="AD Form">AD Form</option>'
         files  +=     ' <option value="LOA">LOA</option>'
         files  +=     '</select>'
         files  +=     '</div>'
         $(".uploaded_files_view").append(files)
      }


   })


   let dblclick_count  = 0
   $("body").on("dblclick", ".imageCount", function (event) {
   $(".delete_lines").show()
      if(delete_clicked){
         delete_clicked =! delete_clicked
         dblclick_count = 0
      }
      let text = ["begin" ,"end"]
      let caltop = 0
      let index_1 = $(".tabs li a.active").attr("index")
      let img =  $('.showpdf'+index_1+' #'+event.target.id+'')
      // var img = parent_class.document.getElementById(event.target.id);
      let images_displayed_count = $('.showpdf'+index_1+' img').length
      let parsed_count = parseInt(event.currentTarget.alt)
      if(images_displayed_count == 1){
         
         caltop = event.offsetY
      }
      else{
         // if(parsed_count > 0 && parsed_count < 2){
         //    for (let i = 0; i <= parsed_count; i++) {
         //         caltop += $('.showpdf'+index_1+' img')[i].offsetTop
         //    } 
         //    caltop = caltop + event.offsetY
         // }
         // else if(parsed_count > 1){
         //    // for (let i = 0; i <= parsed_count; i++) {
         //         caltop = $('.showpdf'+index_1+' img')[parsed_count].offsetTop
         //    // } 
         //    caltop = caltop + event.offsetY
         // }
         if(parsed_count > 0){
            caltop = $('.showpdf'+index_1+' img')[parsed_count].offsetTop
            caltop = caltop + event.offsetY
         }
         else{
            caltop = event.offsetY
         }
         
      }
      var width = img[0].clientWidth;
      var height = img[0].clientHeight;
      var top = img[0].offsetTop
      var left = img[0].offsetLeft

      let x =  0  //event.clientX;
      let y = event.clientY;

      const infoElement = document.getElementById('info');
      infoElement.style.top = y + "px";
      infoElement.style.left = (x + 20) + "px";

      let hors = {
         "color": "blue",
         "height": 15,
         "page": parsed_count,
         "width": width,
         "x": x,
         "top": caltop,
         "text":text[dblclick_count]
      }
      
      $(".save_screen").show()
      drawHorLines(hors, dblclick_count)
      dblclick_count++
      if(dblclick_count == 2){
         dblclick_count  = 0
      }
   })
   // let proceedUrl = originUrl.replace("docsplitter", "train")
   $("body").on("click", ".proceed", function (event) {
      let proceedUrl = 'http://13.235.149.56/training/train.html?case_id='+case_id+'&file_name='+file_id+'&host_name='+tenant_id+'&session=S271803527&retrain=true&template=undefined&user='+user_name+'&splitter=true'
      $(this).attr("href", proceedUrl)
   })


   function loading(ef) {
      if (ef) {
         $(".loadmask").show();
      } else {
         $(".loadmask").hide();
      }
   }


   $(".showbigDoc").scroll(function(e) {
      //.box is the class of the div
      let pageHeight = 0;
      let pageStart = 0;
      let scrollVal = e.target.scrollTop + 100;
      for (let page = 0; page < imagefiles_.length; page++) {
      pageHeight += document.getElementById("imageCountNum" + page).offsetHeight
      if (pageHeight >= scrollVal && pageStart <= scrollVal) {
          onPage = page + 1
          break
      }
      else {
          pageStart = pageHeight
      }
  }
//   pageNo(imagefiles_)
  });


  function pageNo(imagefiles){
   console.log(imagefiles ,onPage)
    let pageNo  = '<p class="page_no_view">'+onPage+' of '+imagefiles.length+'</p>'
    $(".showpage").html(pageNo)
}

 $("body").on("change", ".fileUpload", function () {
   document.getElementById('displayValue').value=this.options[this.selectedIndex].text; 
   document.getElementById('idValue').value=this.options[this.selectedIndex].value;
 })

 $("body").on("change", "#displayValue", function () {
   let key = $(this).attr("key")
   var data = $(this).val();
   $("#field_type"+key).append('<option value = '+data+'>'+data+'</option>')         
 })

 $("body").on("change", ".field_type", function () {
   let key = $(this).attr("key")
   let value = $(this).val()
   $(".displayValue"+key).val(value)

 })
 $("body").on("focus", "#displayValue", function () {
   
 })

 $("body").on("click", ".add_d_i", function () {
   let newobj = {}
   newobj.name ="Identifier"
   newobj.values = []
   doc_i.push(newobj)
   display_DI(doc_i)
 })


//  let doc_i = [
//    {
//       "name":"Identifier",
//       "values":["Invoice Number" ,"Inv Number","Inv Num"]
//    },
//    {
//       "name":"Identifier",
//       "values":["Unit Price" ,"Price/Unit","Unit/Price"]
//    },
//    {
//       "name":"Identifier",
//       "values":["Payment Terms" ,"Terms of Payment","Terms"]
//    }
//  ]


 function display_DI(doc_i){
   
   $("#doc_id").html('')
   let di = ''
   Object.keys(doc_i).forEach(function ( name, i ) {
      var value = doc_i[name];
      di +='<p>'+name+' '+(i+1)+' <img src="images/trash.png" title=""  class="delete_di"   index='+i+' /><img src="images/crop.svg" title="" key='+i+'  class="crop_di"   index='+i+' /></p>'
      di +='<div class="each_doc">'
      di +=   '<select  placeholder="select field" key='+i+' class="field_type" id="field_type'+i+'">'
      di +=         '<option value="select field">select field</option>'
         for (let j = 0; j < value.length; j++) {
            const element = value[j];
            di +=         '<option value="'+element+'">'+element+'</option>'
         }
      di +=   '</select>'
      di +=   '<input type="text" name="'+name+'" key='+i+' class="displayValue displayValue'+i+'" id="displayValue" placeholder="add/select field">'
      di +=   '<input name="idValue" id="idValue" type="hidden">'
      di +='</div>'
  
      // name // the property name
      // value // the value of that property
      // index // the counter
  });
   $("#doc_id").append(di)
 }

 $("body").on("click", ".delete_di", function () {
   let index = $(this).attr('index');
   doc_i.splice(index, 1); 
   display_DI(doc_i)
 })
 storeword = ""
 var getIndex;
 $("body").on("click", ".crop_di", function () {
   let index = $(this).attr("key")
   getIndex  = ""
   getIndex = index
   destroyAreas()
   let nofiles = $(".imageCount").length
   for (var i = 0; i < nofiles; i++) {
   width_ = $("#imageCountNum"+ i).width();
   $("#imageCountNum" + i).selectAreas({
       onChanged: debugHeaderAreas,
       width: width_,
       maxAreas: 1
   });
  }

 })

 function destroyAreas() {
   let nofiles = $(".imageCount").length
   for (var i = 0; i < nofiles; i++) {
       $("#imageCountNum" + i).selectAreas('destroy');
   }
}

 debugHeaderAreas = function debugHeaderAreas(event, id, areas) {
   target = event.target.alt;
   console.log(areas)
   word = getWord(rte(areas[0], $("#showpdf0").width()))
   storeword = getWord(rte(areas[0], $("#showpdf0").width()))
   console.log(storeword)
   $(".displayValue"+getIndex).val(storeword)

}


function rte(box, w) {
   if(box){
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
   } else {
       words_in_box = ''
       notifyMessage('OCR Data is not available!', 'warning')
   }
   return words_in_box;
}
}

function getWord(params) {
  if(params){
   text = ''
   for (let i = 0; i < params.length; i++) {
       text += ' ' + params[i].word;
   }
   return $.trim(text)
  }
}



function displayTemplateDropdowns(list , defaultValue){
    $(".template_name_list").html("");
   console.log(list)
   let opt = ''
   for (let i = 0; i < list.length; i++) {
      if(list[i] == defaultValue ){
         opt += '<option class="selected_option" value="'+list[i]+'">'+list[i]+'</option>'
      }
      else{
         opt += '<option value='+list[i]+'>'+list[i]+'</option>'
      }
   }
   $(".template_name_list").append(opt);
   $('.template_name_list option[value="' + defaultValue + '"]').addClass('custom-class');
}



$("body").on("change", ".template_name_list", function (event) {

   loading(true);
   console.log(storedInfo)
   var opt = $(this).find(':selected');
   var sel = opt.text();
   localStorage.removeItem("selected_Item")
   localStorage.setItem("selected_Item" ,sel)
   var og = opt.closest('optgroup').attr('label');
   var file_type = opt.closest('optgroup').attr('type');
   console.log(sel, og)
   sendObj = {}
   sendObj.case_id = case_id;
   sendObj.tenant_id = tenant_id;
   sendObj.fileName = file_id;
   sendObj.file_type = file_type;
   sendObj.template_name = sel;
   sendObj.splitted_file_name = selected_Item;
   settings11 = {
      "async": true,
      "crossDomain": true,
      "url": dynamicUrl + "/save_template",
      "method": "POST",
      "processData": false,
      "contentType": "application/json",
      "data": JSON.stringify(sendObj)
   };

   $.ajax(settings11).done(function (msg) {
      msg = JSON.parse(msg)
      loading(false);
      if (msg.flag) {
      
      }
   })

})



})
