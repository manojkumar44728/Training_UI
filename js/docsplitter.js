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
      // sendObj.retrain = retrain;
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
         loading(false)
         msg = JSON.parse(msg)
         getTabs(msg.data) 
      })

   }


   $(".save_screen").hide()
   $(".gp_sub").hide()

   function getTabs(data) {

      // Define variables
      var html_tabs = '';
      var html_content = '';
      // Looping data
      for (let index = 0; index < data.length; index++) {
         html_tabs += '<li><a '
         // if(data[index]['active']){
         //    html_tabs += ' class="active "'
         // }
         html_tabs += 'href="#tab' + index + '">' + data[index].fileName + '</a></li>';

         html_content += '<div id="tab' + index + '" class="parent_content">';

         html_content += ' <div class="showbigDoc">'
         html_content += '   <img src="images/split_screen.png"  class="split_page" />'
         html_content += '   <img src="images/save.png"  class="save_screen" />'
         // html_content += '   <button class="save_screen">save screen</button>'
         // assets/pdf/'+tenant_id+'/'+case_id+'/
         let file_name = 'pdf/'+ data[index].fileName + ''
         html_content += ' <div class="viewPdf">'
         html_content += ' <div class="showpdf showpdf' + index + '">'
         html_content += '</div>'
         html_content += ' </div>'
         html_content += ' </div>'

         html_content += '  <div class="vl">'
         html_content += '  </div>'

         html_content += '   <div class="showSmallDoc"><div class="small_img"></div>'
         html_content += '  </div>'

         
         html_content += '   </div>'
         previewPdfFile(file_name, index)
      }
      //display pdf 
      // Set tabs and content html
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
      //console.log(file, index)
      loadXHR(file, index).then(function (blob) {
         var reader = new FileReader();
         reader.onload = function (e) {
            //console.log(e, index, "hai")
            pdftoimg(e.target.result, index)
         }
         reader.readAsDataURL(blob);
      });
   }

   function loadXHR(url, index) {
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
      //console.log("pdftoimg function called", index, file)
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
      //console.log(imagefiles, index)
      img__ = ''
      imagefiles_ = imagefiles;
      for (var i = 0; i < imagefiles.length; i++) {
         img__ += '<img src="' + imagefiles[i] + '" id="imageCountNum' + i + '" class="imageCount imageCountNum' + i + '" alt="' + i + '"  width="100%"> <div id="info"></div></div> ';
      }
      $(".showpdf" + index).empty()
      $(".showpdf" + index).html(img__)
      //  dp_page();
   }

   function dp_page() {
      var dp_nums = dpi_page;
      if (dp_nums.length > 0) {
         for (let i = 0; i < dp_nums.length; i++) {
            var dp_top = adjtop(i);

            dp_top += 14;
            $('.showpdf').append('<div class="dp_class" style="position: absolute;top:' + dp_top + 'px;font-size: 12px;left:20px">' + dp_nums[i] + ' DPI</div>')
         }
      }
   }



   //add hor lines 
  

   $("body").on("click", ".split_page", function () {

      var img = document.getElementsByClassName('imageCount'); 
      var width = img[0].clientWidth;
      var height = img[0].clientHeight;
      var top =img[0].offsetTop
      var left =img[0].offsetLeft
           
      hors = [{
         "color": "blue",
         "height": 15,
         "page": 0,
         "width": width,
         "x": left,
         "top": top
      }, {
         "color": "blue",
         "height": 15,
         "page": 0,
         "width":  width,
         "x": left,
         "top": top+60
   
      }]
      $(".save_screen").show()
      
      for (var i = 0; i < hors.length; i++) {
         drawHorLines(hors[i], i)
      }
   })




   function drawHorLines(points, i) {
      //console.log(points)
      delll = ''
      $(".showpdf").append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line' + i + '" color="' + points.color + '" page="' + points.page + '" id="' + i + '" style="top: ' + (points.top) + 'px;left: ' + points.x + 'px; height: ' + (points.height + 14) + 'px; width: ' + points.width + 'px;"><div class="hor_line" style="background: ' + points.color + '">' + delll + '<img src="images/arrow.svg" alt="" class="left_move" width="15px"><img src="images/arrow.svg" alt="" class="right_move" width="15px"></div></div>');
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



      $(".template_name_modal").hide();
      let hors = $(".horizontal_line")
      stylesarr = []
      for (var i = 0; i < hors.length; i++) {
         var result = {}
         new_attr = hors[i].attributes.style.value.split(';');
         for (var j = 0; j < new_attr.length; j++) {
            var entry = new_attr[j].split(':');
            result[entry.splice(0,1)[0]] = entry.join(':');
         }
         let obj = {
         "coordinates": result,
         }
         lines_return.push(obj)
      }
      let name = $(".template_name_val").val();
      $(".bg_doc").append('<option value="' + name + '">' + name + '</option>')
      $(".gp_sub").show()


      sendObj = {}
      sendObj.file_name = file_id;
      sendObj.case_id = case_id;
      sendObj.tenant_id = tenant_id;
      sendObj.templateName = name;
      sendObj.coordinates = lines_return
      sendObj.Blob = $(".imageCount").attr('src')
      settings11 = {
         "async": true,
         "crossDomain": true,
         "url": dynamicUrl + "/get_coordinates",
         "method": "POST",
         "processData": false,
         "contentType": "application/json",
         "data": JSON.stringify(sendObj)
      };
      
      $.ajax(settings11).done(function (msg) {
         loading(false)
         msg = JSON.parse(msg)
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
            if(msg.flag){

               $(".horizontal_line").remove()
               $(".template_name_val").val("");
               let grouped_dropdown = msg.data
               storedInfo =  msg.data
               let gd = ''
               for (let i = 0; i < grouped_dropdown.length; i++) {
                  const element = grouped_dropdown[i];
                  for (const key in grouped_dropdown[i]) {
                        gd +='<optgroup label="'+key+'" class="bg_doc">'
                        for (let j = 0; j < grouped_dropdown[i][key].length; j++) {
                           storeCoords = grouped_dropdown[i][key][j].SplittedScreenName
                           gd +='<option  value = '+ grouped_dropdown[i][key][j].SplittedScreenName+'>'+ grouped_dropdown[i][key][j].SplittedScreenName+'</option>'
                        }
                        gd +='</optgroup>'
                  }
               }
               $(".gp_sub").empty()
               $(".gp_sub").append(gd)
            }
         })
         $(".small_img").html('')
         let url =$(".imageCount").attr('src')
         var img = document.getElementsByClassName('imageCount'); 
         var width = img[0].clientWidth;
         let top = $(".horizontal_line1").offset().top - $(".horizontal_line0").offset().top
         console.log(top)
         var left = img[0].offsetLeft;
         var top_ = img[0].offsetLeft;
         var image_size = $(".horizontal_line0").offset().top
   
         $(".small_img").css('background-size', width)
         $(".small_img").css("height",top)
         $(".small_img").css("width",width)
         $(".small_img").css("background-image", 'url("'+url+'")')
         $(".small_img").css("background-size" ,width)
         $(".small_img").css("background-position-x" , 0 )
         // $(".small_img").css("background-position-y" , -top)
         $(".small_img").append(' <img src="images/arrow-right.png"  class="open_panel" />')
         updateProps()
      })

      

    

   })

   $("body").on("click", ".gp_sub", function (event) {

      let val = $(this).val()
      console.log(storedInfo)
      // for (let i = 0; i < storedInfo.length; i++) {
      //    const element = storedInfo[i].file_id
      //    console.log(element)
      // }

   })


   $("body").on("click", ".prop_save", function () {

      let displayName = $("#your_name").val()
      let templateType = $("#crusttype").val()
      let mandatory = $("#mandatory").prop("checked")
      let crop = $("#crop").prop("checked")


   })

   function updateProps() {
      //console.log($(".gp_sub").val())
      $("#your_name").val($(".gp_sub").val())
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


   $("body").on("dblclick", ".imageCount", function (event) {


      var img = document.getElementsByClassName('imageCount'); 
      var width = img[0].clientWidth;
      var height = img[0].clientHeight;
      var top =img[0].offsetTop
      var left =img[0].offsetLeft

      let x = event.clientX;
      let y = event.clientY;

      const infoElement = document.getElementById('info');
      infoElement.style.top = y + "px";
      infoElement.style.left = (x + 20) + "px";
           
      let hors = [{
         "color": "blue",
         "height": 15,
         "page": 0,
         "width": width,
         "x": (x + 20),
         "top": y
      }, {
         "color": "blue",
         "height": 15,
         "page": 0,
         "width":  width,
         "x": (x + 20),
         "top": y+60
   
      }]
      $(".save_screen").show()
      
      for (var i = 0; i < hors.length; i++) {
         drawHorLines(hors[i], i)
      }



     


      // let x = event.clientX;
      // let y = event.clientY;
      // let _position = `X: ${x}<br>Y: ${y}`;

      // const infoElement = document.getElementById('info');
      // infoElement.innerHTML = _position;
      // infoElement.style.top = y + "px";
      // infoElement.style.left = (x + 20) + "px";

      // $('#divIntro')
      // .show()
      // .append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line" ><div class="hor_line" style="background:blue;"><img src="images/arrow.svg" alt="" class="left_move" width="15px"><img src="images/arrow.svg" alt="" class="right_move" width="15px"></div><div class="header_crop table_crop hor_gen_ver  drawThis horizontal_line2" ><div class="hor_line" style="background:blue;"><img src="images/arrow.svg" alt="" class="left_move" width="15px"><img src="images/arrow.svg" alt="" class="right_move" width="15px"></div>')
      // $(".horizontal_line").css({ position: 'absolute', color: '#000',left:0, top: e.pageY ,width:'400px'});
      // $(".horizontal_line2").css({ position: 'absolute', color: '#000',left:0, top: e.pageY+30 ,width:'400px'});

      // $(this).append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line" ><div class="hor_line" style="background:blue;"><img src="images/arrow.svg" alt="" class="left_move" width="15px"><img src="images/arrow.svg" alt="" class="right_move" width="15px"></div>')
      // $(".horizontal_line").css({ position: 'absolute', width:"500px",background: 'blue',
      //     left:"0px", top: e.pageY ,height:"2px"
      // });
      // var x = event.pageX - this.offsetLeft;
      // var y = event.pageY - this.offsetTop;
      // alert("X Coordinate: " + x + " Y Coordinate: " + y);
      // // top = y + "px";
      // // left = (x + 20) + "px";
      // // //console.log(x , y ,top , left )
      // $(".imageCount").append('<div class="header_crop table_crop hor_gen_ver horizontal_line drawThis horizontal_line"  style="top: '+(top)+'px;left: ' +left+ 'px; width:"300px"><div class="hor_line" style="background:blue;"><img src="images/arrow.svg" alt="" class="left_move" width="15px"><img src="images/arrow.svg" alt="" class="right_move" width="15px"></div></div>')
      // $(".horizontal_line").draggable({})
      // $("#info").draggable({})



      // wrapper = $(this).parent();
      // parentOffset = wrapper.offset();
      // lft = e.pageX - parentOffset.left + wrapper.scrollLeft();
      // let El = $(this)
      // const element = El;
      // const infoElement = document.getElementById('info');
      // infoElement.style.top = element.offsetTop;
      // infoElement.style.left = element.offsetLeft;
      // infoElement.style.width = element.offsetWidth;
      // infoElement.style.height = element.offsetHeight;
      // infoElement.innerHTML = "hai";
      // let El = $(this)
      // for (let i = 0; i < El.length; i++) {
      //    const element = El[i];
      //    let a = {
      //       "color": "blue",
      //       "height": element.offsetHeight,
      //       "width": element.offsetWidth,
      //       "x": element.offsetLeft,
      //       "top": element.offsetTop,
      //       "page": ''
      //    }
      //    drawHorLines(a, 1)
      // }




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