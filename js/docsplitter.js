$(document).ready(function () {
   // Json Data Tab
   let originUrl = window.location.href
   let proceedUrl = originUrl.replace("docsplitter", "train")
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
   file_id = file_id ? file_id : ''
   retrain = nullCheck(retrain) ? (retrain == 'true' ? true : false) : false


   

   dynamicUrl = "http://3.110.230.254:5002"
   pageLoad()

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
         getTabs(msg.data)
         // getGroupInfo()
      })

   }


   function getGroupInfo(){
      sendObj = {}
      sendObj.FileName = file_id;
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
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
         loading(false)
         msg = JSON.parse(msg)
         if (msg.flag) {
            $(".horizontal_line").remove()
            $(".template_name_val").val("");
            let grouped_dropdown = msg.data
            storedInfo = msg.data
            localStorage.removeItem("Grouped_Info")
            localStorage.setItem("Grouped_Info", JSON.stringify(storedInfo))
            let gd = ''
            for (let i = 0; i < grouped_dropdown.length; i++) {
               const element = grouped_dropdown[i];
               for (const key in grouped_dropdown[i]) {
                  gd += '<optgroup label="' + key + '" class="bg_doc">'
                  for (let j = 0; j < grouped_dropdown[i][key].length; j++) {
                     var sel = ''
                     // if (name == grouped_dropdown[i][key][j].SplittedScreenName) {
                     //    sel = 'selected'
                     // }
                     storeCoords = grouped_dropdown[i][key][j].SplittedScreenName
                     gd += '<option ' + sel + '  value = ' + grouped_dropdown[i][key][j].SplittedScreenName + '>' + grouped_dropdown[i][key][j].SplittedScreenName + '</option>'
                  }
                  gd += '</optgroup>'
               }
            }
            $(".gp_sub").empty()
            $(".gp_sub").append(gd)
            $("#your_name").val("")
            $("#crusttype").val("")
            $("#mandatory").prop("checked", false)
            $('input[name="pg"]').attr('checked', false);
            $("#crop").prop("checked", false)
         }
         })

   }


   $(".save_screen").hide()
   $(".gp_sub").hide()

   function getTabs(data) {
      let file_name
      let findindex
      var html_tabs = '';
      var html_content = '';
      for (let index = 0; index < data.length; index++) {
         html_tabs += '<li><a '
         html_tabs += 'href="#tab' + index + '" name="'+data[index].fileName+'"   filePath ="pdf/' + data[index].fileName + '" index='+index+'    >' + data[index].fileName + '</a></li>';
         html_content += '<div id="tab' + index + '" class="parent_content">';
         html_content += ' <div class="showbigDoc">'
         html_content += '   <img src="images/split_screen.png"  class="split_page" index='+index+' />'
         html_content += '   <img src="images/save.png"  class="save_screen" />'
         // html_content += '   <button class="save_screen">save screen</button>'
         // assets/pdf/'+tenant_id+'/'+case_id+'/
         // file_name = 'pdf/' + data[index].fileName + ''
         // findindex = index
         html_content += ' <div class="viewPdf">'
         html_content += ' <div id="showpdf' + index + '" class="showpdf showpdf' + index + '">'
         html_content += '</div>'
         html_content += ' </div>'
         html_content += ' </div>'
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
      previewPdfFile(file_name ,findindex)
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
   function previewPdfFile(file, index) {
      console.log("previewPdfFile called")
      loadXHR(file, index).then(function (blob) {
         var reader = new FileReader();
         reader.onload = function (e) {
            pdftoimg(e.target.result, index)
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

   function pdftoimg(file, index) {
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
                  displayImage(imagesArr, index)
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

   function displayImage(imagefiles, index) {

      console.log(imagefiles, index ,"displyaImage")
      img__ = ''
      imagefiles_ = imagefiles;
      for (var i = 0; i < imagefiles.length; i++) {
         img__ += '<img src="' + imagefiles[i] + '" id="imageCountNum' + i + '" class="imageCount imageCountNum' + i + '" alt="' + i + '"  width="100%"> <div id="info"></div></div> ';
      }
      $(".showpdf" + index).empty()
      $(".showpdf" + index).html(img__)
   }




   //add hor lines 


   $("body").on("click", ".split_page", function () {

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
      //console.log(points)
      delll = ''
      $(".showpdf").append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line' + i + '" color="' + points.color + '" page="' + points.page + '" id="' + i + '" style="top: ' + (points.top) + 'px;left: ' + points.x + 'px; height: ' + (points.height + 14) + 'px; width: ' + points.width + 'px;"><div class="hor_line" style="background: ' + points.color + '">' + delll + '<span class="span_text">'+points.text+'</span> </div></div>');
      // $(".delete_line").hide();
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
      $(".template_name_modal").show();


   })

   let storedInfo

   $("body").on("click", ".saveBtn", function () {

      loading(true);
      lines_return = []
      $(".template_name_modal").hide();
      let index_1 = $(".tabs li a.active").attr("index")
      let hors = $('.showpdf'+index_1+' .horizontal_line')
      stylesarr = []
      for (var i = 0; i < hors.length; i++) {
         var result = {}
         new_attr = hors[i].attributes.style.value.split(';');
         for (var j = 0; j < new_attr.length; j++) {
            var entry = new_attr[j].split(':');
            result[entry.splice(0, 1)[0]] = entry.join(':');
         }
         let obj = {
            "coordinates": result,
         }
         lines_return.push(obj)
      }
      let name = $(".template_name_val").val();
      $(".gp_sub").show()
      $(".small_img").html('')
      let getindex= $(".tabs li a.active").attr("index")

      //single page
      var img =  $('.showpdf'+ getindex+' img')
      if(img.length == 1){
      var width = img[0].clientWidth;
      let url = $('.showpdf'+ getindex+' img').attr('src')
      let top = $('.showpdf'+ getindex+' .horizontal_line1').offset().top - $('.showpdf'+ getindex+' .horizontal_line0').offset().top
      console.log($('.showpdf'+ getindex+' .horizontal_line1').offset().top, $('.showpdf'+ getindex+' .horizontal_line0').offset().top)
      $(".small_img").css("height", top)
      $(".small_img").css("width", width)
      $(".small_img").css("background-image", 'url("' + url + '")')
      $(".small_img").css('background-size', width)
      let line0_top = $('.showpdf'+ getindex+' .horizontal_line0')[0].style.top
      let con_top = parseInt(line0_top)
      $(".small_img").css("background-position-y", -con_top)
      }
      else{
         var width = img[0].clientWidth;
         let url = $('.showpdf'+ getindex+' img').attr('src')
         let top = $('.showpdf'+ getindex+' .horizontal_line1').offset().top - $('.showpdf'+ getindex+' .horizontal_line0').offset().top
         let cal_no_images = $('.showpdf'+ getindex+' img')
         let store_blobs = []
         for (let cal_i = 0; cal_i < cal_no_images.length; cal_i++) {
            let url = $('.showpdf'+ getindex+' #imageCountNum'+cal_i+'').attr('src')
            store_blobs.push(url)
         }
         for (let cal_j = 0; cal_j < store_blobs.length; cal_j++) {
            let a = ''
            a+='<img src='+store_blobs[cal_j]+'  class="stored_blob_elements stored_blob_elements'+cal_j+'">'
            $(".small_img"+getindex).append(a)
            

            // $('.small_img'+getindex+' .stored_blob_elements'+cal_j+'').css("background-image", 'url("'+store_blobs[cal_j]+'")')
         }
         $(".small_img"+getindex).css("height", top)
         $('.small_img'+getindex+' .stored_blob_elements').css("width", width)
         // $('.small_img'+getindex+' .stored_blob_elements').css('background-size', width)
         // $('.small_img'+getindex+' .stored_blob_elements').css("height", image_height)
         // $('.small_img'+getindex+' .stored_blob_elements').css("width", width)
         // $('.small_img'+getindex+' .stored_blob_elements').css("background-size", width)
      }
      $(".small_img").append(' <img src="images/arrow-right.png"  class="open_panel" />')
      sendObj = {}
      sendObj.FileName = file_id;
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.templateName = name;
      sendObj.coordinates = lines_return
      sendObj.Height = $('.showpdf'+ getindex+' .horizontal_line1').offset().top - $('.showpdf'+ getindex+' .horizontal_line0').offset().top
      sendObj.Blob = $(".imageCount").attr('src')
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
         // $(".horizontal_line").remove()
         $(".template_name_val").val("");
         let grouped_dropdown = msg.data
         storedInfo = msg.data
         localStorage.removeItem("Grouped_Info")
         localStorage.setItem("Grouped_Info", JSON.stringify(storedInfo))
         let gd = ''
         for (let i = 0; i < grouped_dropdown.length; i++) {
            const element = grouped_dropdown[i];
            for (const key in grouped_dropdown[i]) {
               gd += '<optgroup label="' + key + '" class="bg_doc">'
               for (let j = 0; j < grouped_dropdown[i][key].length; j++) {
                  var sel = ''
                  if (name == grouped_dropdown[i][key][j].SplittedScreenName) {

                     sel = 'selected'
                  }
                  storeCoords = grouped_dropdown[i][key][j].SplittedScreenName
                  gd += '<option ' + sel + '  value = ' + grouped_dropdown[i][key][j].SplittedScreenName + '>' + grouped_dropdown[i][key][j].SplittedScreenName + '</option>'
               }
               gd += '</optgroup>'
            }
         }
         $(".gp_sub").empty()
         $(".gp_sub").append(gd)
         $("#your_name").val(name)
         $("#crusttype").val("")
         $("#mandatory").prop("checked", false)
         $('input[name="pg"]').attr('checked', false);
         $("#crop").prop("checked", false)
        }
      })

   })



   $("body").on("change", ".gp_sub", function (event) {
      loading(true);
      console.log(storedInfo)
      var opt = $(this).find(':selected');
      var sel = opt.text();
      localStorage.removeItem("selected_Item")
      localStorage.setItem("selected_Item" ,sel)
      var og = opt.closest('optgroup').attr('label');
      console.log(sel, og)
      sendObj = {}
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.fileName = file_id;
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
      loading(false);

         msg = JSON.parse(msg)
          let group_info = msg.data
         for (let i = 0; i < group_info.length; i++) {
            if (group_info[i].SplittedScreenName == sel) {
               let height = group_info[i].Height
               let width = group_info[i].coordinates[1][" width"]
               let blob = group_info[i].blob
               $(".small_img").html('')
               $(".small_img").css('background-size', width)
               $(".small_img").css("height", height)
               $(".small_img").css("width", width)
               $(".small_img").css("background-image", 'url("' + blob + '")')
               $(".small_img").css("background-size", width)
               $(".small_img").css("background-position-x", 0)
               let line0_top = group_info[i].coordinates[0].top
               let con_top = parseInt(line0_top)
               $(".small_img").css("background-position-y", -con_top)
               $(".small_img").append(' <img src="images/arrow-right.png"  class="open_panel" />')
               updateProps(group_info[i].properties)
               let text = ["begin" ,"end"]
               $(".horizontal_line").remove()
               for (var ii = 0; ii < group_info[i].coordinates.length; ii++) {
                  let obj = {}
                  obj["height"] = group_info[i].coordinates[ii][" height"]
                  obj["width"] = group_info[i].coordinates[ii][" width"]
                  obj["top"] = group_info[i].coordinates[ii]["top"]
                  delll = ''
                  $(".showpdf").append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line' + ii + '" color="blue" id="' + ii + '" style="top: ' + group_info[i].coordinates[ii]["top"] + '; height:'+group_info[i].coordinates[ii][" height"]+'; width: '+group_info[i].coordinates[ii][" width"]+'"><div class="hor_line" style="background:blue">' + delll + '<span class="span_text">'+text[ii]+'</span> </div></div>');
                  // $(".delete_line").hide();
                  $(".horizontal_line").draggable({});
               }
            }
         }
      })

   })


   $("body").on("click", ".prop_save", function () {
      loading(true);
      let templateType = $("#crusttype").val()
      let mandatory = $("#mandatory").prop("checked")
      let PO = $('input[name="pg"]:checked').val();
      let crop = $("#crop").prop("checked")
      sendObj = {}
      sendObj.fileName = file_id;
      sendObj.SPlittedName=  $(".template_name_val").val()
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.templateType = templateType;
      sendObj.Mandatory = mandatory;
      sendObj.Crop = crop;
      sendObj.PageOrientation = PO
      // "PageOrientation" : "portrait",
      sendObj.DocumentIdentifiers = []
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
         // if(msg.flag){
         //    $.alert("Properties Saved Successfully", 'Alert');
         // }
      })

   })

   function updateProps(data) {
      if(data){
         console.log(data)
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

   $("body").on("click", ".Upload", function () {
      $(".file_upload").click()
   })

   $("body").on("change", ".fileUpload", function () {
      sendObj = {}
      var file = $(this)[0].files[0];
      let fileName = file['name'];
      var fileReader = new FileReader();
      fileReader.onloadend = function (e) {
         blob___ = e.target.result;
         sendObj.FileName = fileName;
         sendObj.Blob = blob___;
         sendObj.case_id = case_id;
         sendObj.tenant_id = tenant_id
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


   })


   let dblclick_count  = 0
   $("body").on("dblclick", ".imageCount", function (event) {
      let text = ["begin" ,"end"]
      let caltop = 0
      let index_1 = $(".tabs li a.active").attr("index")
      let img =  $('.showpdf'+index_1+' #'+event.target.id+'')
      // var img = parent_class.document.getElementById(event.target.id);
      let images_displayed_count = $('.showpdf'+index_1+' img').length
      if(images_displayed_count == 1){
         caltop = event.offsetY
      }
      else{
         let parsed_count = parseInt(event.currentTarget.alt)
         if(parsed_count > 0){
            for (let i = 0; i <= parsed_count; i++) {
                 caltop += $('.showpdf'+index_1+' img')[i].offsetTop
            } 
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
         "page": 0,
         "width": width,
         "x": x,
         "top": caltop,
         "text":text[dblclick_count]
      }
      // , {
      //    "color": "blue",
      //    "height": 15,
      //    "page": 0,
      //    "width": width,
      //    "x": x,
      //    "top": y + 60,
      //    "text":"end"


      // }]
      $(".save_screen").show()

      // for (var i = 0; i < hors.length; i++) {
         drawHorLines(hors, dblclick_count)
      // }
      dblclick_count++




       
   })

   $("body").on("click", ".proceed", function (event) {

      $(this).attr("href", proceedUrl)

   })


   function loading(ef) {
      if (ef) {
         $(".loadmask").show();
      } else {
         $(".loadmask").hide();
      }
   }

})