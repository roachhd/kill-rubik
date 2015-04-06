/*
Kill Rubik JS
http://katieball.me.com/
Copyright (c) 2015 Katie Ball <katie@roachhd.com>
*/


var t;
var verbosity = 2;
var use_keyb = false;
var run_clear = false;
var scramble_depth = 32;
var seen_instructions = false;
var current_color = 'U';
var cube_state_empty = '____u________r________f________d________l________b____';
var cube_state_clean = 'uuuuuuuuurrrrrrrrrfffffffffdddddddddlllllllllbbbbbbbbb';
var cube_state = cube_state_empty;
var cube_history = new Array();
var cube_hist_at = 0;
var magnify = 4;
var cube_cookie = 'SMCDATA';


var lbl_e = ['UR','UF','UL','UB','DR','DF','DL','DB','FR','FL','BL','BR'];
var pol_e = {
   UR:[ 6,11],UF:[ 8,20],UL:[ 4,38],UB:[ 2,47],DR:[33,17],DF:[29,26],
   DL:[31,44],DB:[35,53],FR:[24,13],FL:[22,42],BL:[51,40],BR:[49,15]
};
var lbl_c = ['URF','UFL','ULB','UBR','DFR','DLF','DBL','DRB'];
var pol_c = {
   URF:[ 9,10,21],UFL:[ 7,19,39],ULB:[ 1,37,48],UBR:[ 3,46,12],
   DFR:[30,27,16],DLF:[28,45,25],DBL:[34,54,43],DRB:[36,18,52]
};


var turn = {
   U:{1:3,2:6,3:9,4:2,6:8,7:1,8:4,9:7,19:37,20:38,21:39,37:46,38:47,39:48,46:10,47:11,48:12,10:19,11:20,12:21},
   R:{10:12,11:15,12:18,13:11,15:17,16:10,17:13,18:16,9:46,6:49,3:52,46:36,49:33,52:30,36:27,33:24,30:21,27:9,24:6,21:3},
   F:{19:21,20:24,21:27,22:20,24:26,25:19,26:22,27:25,7:10,8:13,9:16,10:30,13:29,16:28,30:45,29:42,28:39,45:7,42:8,39:9},
   D:{28:30,29:33,30:36,31:29,33:35,34:28,35:31,36:34,25:16,26:17,27:18,16:52,17:53,18:54,52:43,53:44,54:45,43:25,44:26,45:27},
   L:{37:39,38:42,39:45,40:38,42:44,43:37,44:40,45:43,1:19,4:22,7:25,19:28,22:31,25:34,28:54,31:51,34:48,54:1,51:4,48:7},
   B:{46:48,47:51,48:54,49:47,51:53,52:46,53:49,54:52,1:43,2:40,3:37,43:36,40:35,37:34,36:12,35:15,34:18,12:1,15:2,18:3}
};


var facet = [
   'U1','U2','U3','U4','U5','U6','U7','U8','U9',
   'R1','R2','R3','R4','R5','R6','R7','R8','R9',
   'F1','F2','F3','F4','F5','F6','F7','F8','F9',
   'D1','D2','D3','D4','D5','D6','D7','D8','D9',
   'L1','L2','L3','L4','L5','L6','L7','L8','L9',
   'B1','B2','B3','B4','B5','B6','B7','B8','B9'
];


var move_des = {
   U:[   'Turn the top layer of the Cube 90 degrees in a clockwise direction.',
      'Turn the top layer of the Cube 90 degrees in a counter-clockwise direction.',
      'Turn the top layer of the Cube 180 degrees in either direction.'],
   R:[   'Turn the right side of the Cube 90 degrees in a clockwise direction.',
      'Turn the right side of the Cube 90 degrees in a counter-clockwise direction.',
      'Turn the right side of the Cube 180 degrees in either direction.'],
   F:[   'Turn the front side of the Cube 90 degrees in a clockwise direction.',
      'Turn the front side of the Cube 90 degrees in a counter-clockwise direction.',
      'Turn the front side of the Cube 180 degrees in either direction.'],
   D:[   'Turn the bottom layer of the Cube 90 degrees in a clockwise direction.',
      'Turn the bottom layer of the Cube 90 degrees in a counter-clockwise direction.',
      'Turn the bottom layer of the Cube 180 degrees in either direction.'],
   L:[   'Turn the left side of the Cube 90 degrees in a clockwise direction.',
      'Turn the left side of the Cube 90 degrees in a counter-clockwise direction.',
      'Turn the left side of the Cube 180 degrees in either direction.'],
   B:[   'Turn the back side of the Cube 90 degrees in a clockwise direction.',
      'Turn the back side of the Cube 90 degrees in a counter-clockwise direction.',
      'Turn the back side of the Cube 180 degrees in either direction.']
};


/*

 1  2  3  4  5  6  7  8  9
U1 U2 U3 U4 U5 U6 U7 U8 U9

10 11 12 13 14 15 16 17 18
R1 R2 R3 R4 R5 R6 R7 R8 R9

19 20 21 22 23 24 25 26 27
F1 F2 F3 F4 F5 F6 F7 F8 F9

28 29 30 31 32 33 34 35 36
D1 D2 D3 D4 D5 D6 D7 D8 D9

37 38 39 40 41 42 43 44 45
L1 L2 L3 L4 L5 L6 L7 L8 L9

46 47 48 49 50 51 52 53 54
B1 B2 B3 B4 B5 B6 B7 B8 B9

*/


(function($) {
   $.fn.setFacets = function(facets,color,count){
      if (count == undefined) count = true;
      $(this)
       .find('div.'+facets.toLowerCase())
       .removeClass('p-u p-r p-f p-d p-l p-b')
       .addClass((color=='')?'':'p-'+color.toLowerCase());
      if (count){
         for (var i in turn){
            i = i.toString().toLowerCase();
            var num = $('.rubiks-cube div.p-'+i).length;
            if (i == 'na') continue;
            $('#cube-colorcount li.ccc-'+i+' span').html(num);
            if (num > 9)
               $('#cube-colorcount li.ccc-'+i).removeClass('good').addClass('bad');
            else if (num == 9)
               $('#cube-colorcount li.ccc-'+i).removeClass('bad').addClass('good');
            else
               $('#cube-colorcount li.ccc-'+i).removeClass('good bad');
         }
      }
      return this;
   }
})(jQuery);
console = function(stuff,v){
   if (v == undefined || verbosity >= v)
      $('#console-output').append(stuff+'\n').scrollTop($('#console-output').attr('scrollHeight'));
   return stuff;
}
openConsole = function(){
   $('#console-controls').fadeOut(200,function(){
      $('#console').slideDown(300,function(){
         $('#console-toggle').text('Close Console');
         $('#console-expand').show();
         $('#console-controls').addClass('open').fadeIn(200);
         $('#console-input input').focus();
         $('#console-output').scrollTop($('#console-output').attr('scrollHeight'));
      });
   });
}
closeConsole = function(){
   $('#console-controls').fadeOut(200,function(){
      $('#console').slideUp(300,function(){
         $('#console-toggle').text('Open Console');
         $('#console-expand').hide();
         $('#console-controls').removeClass('open').fadeIn(200);
      });
   });
}
expandConsole = function(){
   $('#console-controls').fadeOut(200,function(){
      if ($('#console-expand').text() == '+'){
         if ($('#console-output').data('org_height') == undefined)
            $('#console-output').data('org_height',$('#console-output').height())
         $('#console-output').animate({height:($(window).height()-$('#console-input').height()-$('#console-controls').height()-25)},300,function(){
            $('#console-expand').text('-').fadeIn(200);
            $('#console-controls').addClass('expanded').fadeIn(200);
            $('#console-input input').focus();
         });
      }else{
         $('#console-output').animate({height:$('#console-output').data('org_height')},300,function(){
            $('#console-expand').text('+').fadeIn(200);
            $('#console-controls').removeClass('expanded').fadeIn(200);
            $('#console-input input').focus();
            $(this).scrollTop($('#console-output').attr('scrollHeight'));
         });
      }
   });
}
consoleHist = function(stuff,clear){
   var ret;
   var cd = $('#console').data();
   if (cd.hist == undefined || cd.hist2 == undefined || cd.pos == undefined)
      cd = {hist:[],hist2:[],pos:0,current:''};
   if (typeof stuff == 'string' && clear != undefined && clear){
      cd.pos = 0;
      ret = cd.hist.unshift(stuff);
      cd.hist2 = cd.hist;
      cd.current = '';
   }else if (typeof stuff == 'string' && (clear == undefined || !clear)){
      if (cd.pos>0){
         var pos = cd.pos-1;
         cd.hist2[pos] = stuff;
      }else{
         cd.current = stuff;
      }
   }else if (typeof stuff == 'number'){
      if (stuff == 0 && clear != undefined && clear){
         cd.pos = 0;
         cd.hist2 = cd.hist;
         cd.current = '';
      }else{
         cd.pos += -stuff;
         if (cd.pos-1>=cd.hist.length) cd.pos = cd.hist.length;
         else if (cd.pos<0) cd.pos = 0;
         var pos = cd.pos-1;
         ret = (cd.hist[pos]==undefined)?cd.current:cd.hist2[pos];
      }
   }else{
      ret = false;
   }
   //alert(cd.hist+'\n'+cd.pos);
   $('#console').data(cd);
   return ret;
}
execute = function(command,callback){
   console('&gt; '+command);
   //consoleHist(command);
   var callback = callback;
   $.get('srv.php?'+command,function(data){
      if ($(data).length && command.split(' ').shift() == 'solve' && command != 'solve help'){
         var reply = $(data).text().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      }else{
         var reply = data;
      }
      console(reply);
      if (typeof callback == 'function'){
         callback(reply);
      }
   },'html');
}
resetCube = function(){
   $('div.rubiks-cube')
    .setFacets('U','U',false)
    .setFacets('R','R',false)
    .setFacets('F','F',false)
    .setFacets('D','D',false)
    .setFacets('L','L',false)
    .setFacets('B','B',true)
   
   return cube_state_clean;
}
clearCube = function(){
   $('div.rubiks-cube')
    .setFacets('Z','',false)
    .setFacets('U5','U',false)
    .setFacets('R5','R',false)
    .setFacets('F5','F',false)
    .setFacets('D5','D',false)
    .setFacets('L5','L',false)
    .setFacets('B5','B',true)
   
   return cube_state_empty;
}


var ce_vars = [];
cubeExecute = function(algorithm,cs){
   if (typeof cube_state != 'string' || cube_state.length != 54){
      var cube_state = cubeState();
   }
   var moves = algorithm.toUpperCase().match(/[URFDLB]['2]?/g);
   if (moves != null){
      for (var i in moves){
         cs = cubeTurn(moves[i],cs);
      }
   }
   return cs;
}
cubeState = function(new_state){
   if (new_state != undefined && typeof new_state == 'string' && new_state.length == 54){
      var obj = $('div.rubiks-cube');
      for (k in facet){
         obj.setFacets(facet[k],new_state[k].toUpperCase(),(k==53));
      }
      return new_state;
   }else{
      var cube_state = [];
      $('div.rubiks-cube div.z').each(function(){
         var color = $(this).get(0).className.match(/\bp-[urfdlb]\b/i);
         if (color != null && color[0].length) color = color[0].replace(/p-/i,'');
         else color = '_';
         cube_state.push(color);
      });
      return cube_state.join('').toLowerCase();
   }
}
cubeTurn = function(trn,cube_state){
   var t = trn[0].toUpperCase();
   var tt = trn[1];
   if (t != 'U' && t != 'R' && t != 'F' && t != 'D' && t != 'L' && t != 'B')
      return false;
   if (typeof cube_state != 'string' || cube_state.length != 54){
      var cube_state = cubeState();
   }
   var ncs = cube_state;
   for (k in turn[t]){
      var x = ((tt == '\'')?k:turn[t][k])-1;
      var f = (tt == '\'')?cube_state.substr(turn[t][k]-1,1):cube_state.substr(k-1,1);
      ncs = ncs.substr(0,x)+f+ncs.substr(x+1);
   }
   if (tt == '2'){
      cube_state = ncs;
      for (k in turn[t]){
         var x = turn[t][k]-1;
         var f = cube_state.substr(k-1,1);
         ncs = ncs.substr(0,x)+f+ncs.substr(x+1);
      }
   }
   //cubeState(ncs);
   return ncs;
}
cubeRandom = function(){
   console('Warning: This function is flawed and may give "unsolvable" cubes.',1);
   var cs = cube_state_clean;
   var ncs = cs;
   var pole = lbl_e.slice(0);
   var polc = lbl_c.slice(0);
   var n, y, pol, c, len, np, f;
   pol = n = 0; c = 2; len = 12;
   for (x in pol_e){
      n++;
      r = pole.splice(Math.floor(Math.random()*pole.length),1)[0];
      if (n == len){
         y = pol%c;
      }else{
         y = Math.floor(Math.random()*c);
         pol += y;
      }
      np = pol_e[x].slice(y).concat(pol_e[x].slice(0,y));
      f = [cs.substr(np[0]-1,1),cs.substr(np[1]-1,1)];
      ncs = ncs.substr(0,pol_e[r][0]-1)+f[0]+ncs.substr(pol_e[r][0]);
      ncs = ncs.substr(0,pol_e[r][1]-1)+f[1]+ncs.substr(pol_e[r][1]);
   }
   pol = n = 0; c = 3; len = 8;
   for (x in pol_c){
      n++;
      r = polc.splice(Math.floor(Math.random()*polc.length),1)[0];
      if (n == len){
         y = c-pol%c;
      }else{
         y = Math.floor(Math.random()*c);
         pol += y;
      }
      np = pol_c[x].slice(y).concat(pol_c[x].slice(0,y));
      f = [cs.substr(np[0]-1,1),cs.substr(np[1]-1,1),cs.substr(np[2]-1,1)];
      ncs = ncs.substr(0,pol_c[r][0]-1)+f[0]+ncs.substr(pol_c[r][0]);
      ncs = ncs.substr(0,pol_c[r][1]-1)+f[1]+ncs.substr(pol_c[r][1]);
      ncs = ncs.substr(0,pol_c[r][2]-1)+f[2]+ncs.substr(pol_c[r][2]);
   }
   //console('Edges valid? '+cubeEdgePolarity(ncs)+'\tCorners valid? '+cubeCornerPolarity(ncs),3);
   return ncs;
}
cubeEdgePolarity = function(cube_state){
   var cube_state = cube_state;
   if (typeof cube_state != 'string' || cube_state.length != 54){
      var cube_state = cubeState();
   }
   var pol = 0;
   var valid = true;
   for (k in pol_e){
      var a = cube_state[pol_e[k][0]-1].toUpperCase();
      var b = cube_state[pol_e[k][1]-1].toUpperCase();
      if (pol_e[a+b] != undefined){
         console('Edge '+k+' is "'+a+b+'" and has a neutral polarity.',3);
      }else if (pol_e[b+a] != undefined){
         pol++;
         console('Edge '+k+' is "'+a+b+'" and has a positive polarity.',3);
      }else{
         var valid = false;
         console('Warning: Edge '+k+' is "'+a+b+'" and is invalid.',2);
      }
   }
   console('Final edge polarity value: '+pol,2);
   return valid?(pol%2==0):false; // even is true, odd is false
}
cubeCornerPolarity = function(cube_state){
   var cube_state = cube_state;
   if (typeof cube_state != 'string' || cube_state.length != 54){
      var cube_state = cubeState();
   }
   var pol = 0;
   var valid = true;
   for (k in pol_c){
      var a = cube_state[pol_c[k][0]-1].toUpperCase();
      var b = cube_state[pol_c[k][1]-1].toUpperCase();
      var c = cube_state[pol_c[k][2]-1].toUpperCase();
      if (pol_c[a+b+c] != undefined){
         console('Corner '+k+' is "'+a+b+c+'" and has a neutral polarity.',3);
      }else if (pol_c[c+a+b] != undefined){
         pol++;
         console('Corner '+k+' is "'+a+b+c+'" and has a positive polarity.',3);
      }else if (pol_c[b+c+a] != undefined){
         pol--;
         console('Corner '+k+' is "'+a+b+c+'" and has a negative polarity.',3);
      }else{
         var valid = false;
         console('Warning: Corner '+k+' is "'+a+b+c+'" and is invalid.',2);
      }
   }
   console('Final corner polarity value: '+pol,2);
   return valid?(pol%3==0):false; // divisible by 3 is true, otherwise false
}
cubeHistory = function(hist){
   var hlen = cube_history.length;
   if (hist != undefined && typeof hist == 'string' && hist.length == 54){
      if (cube_hist_at != -1){
         cube_history = cube_history.slice(0,cube_hist_at+1);
      }
      cube_history.push(hist);
      cube_hist_at = -1;
      return true;
   }else if(typeof hist == 'number' && hlen > 0 && cube_hist_at >= -1 && cube_hist_at < hlen){
      if (cube_hist_at == -1){
         if (hist > 0) return false;
         cube_hist_at = (hlen-1)+hist;
      }else if ((cube_hist_at == 0 && hist < 0) || (cube_hist_at == hlen-1 && hist > 0)){
         return false;
      }else{
         cube_hist_at += hist;
      }
      return cube_history[cube_hist_at];
      if (cube_hist_at == hlen-1){
         cube_hist_at = -1;
      }
   }else{
      return false;
   }
}
dataSave = function(key,value){
   if (typeof key == 'string'){
      obj = {};
      obj[key] = value;
      key = obj;
   }
   if (typeof key == 'object'){
      var date = new Date();
      if (key != {}){
         var old = dataLoad();
         if (old != {}){
            key = $.extend({},old,key);
         }
         var list = new Array();
         for (var i in key){
            list.push(i+'='+escape(key[i]));
         }
         var stuff = list.join('&');
         date.setTime(date.getTime() + 2592000000); // +30 days in ms (30*24*60*60*1000)
      }else{
         var stuff = '';
         date.setTime(date.getTime() - 86400000); // -1 day in ms (-1*24*60*60*1000)
      }
      document.cookie = cube_cookie+'='+escape(stuff)+';expires='+date.toUTCString();
      return true;
   }else{
      return false;
   }
}
dataLoad = function(key){
   if (document.cookie.length > 0){
      var c_start=document.cookie.indexOf(cube_cookie+'=');
      if (c_start!=-1){
         c_start=c_start + cube_cookie.length+1;
         var c_end=document.cookie.indexOf(';',c_start);
         if (c_end==-1) c_end=document.cookie.length;
         var stuff = unescape(document.cookie.substring(c_start,c_end));
         var list = stuff.split('&');
         var value = {};
         for (var i in list){
            var tmp = list[i].split('=');
            value[tmp[0]] = unescape(tmp[1]);
         }
         if (typeof key == 'string'){
            return (value[key]==undefined)?null:value[key];
         }else if (typeof key == 'object' && key instanceof Array){
            var ret = new Array();
            for (var i in key){
               ret.push((value[key[i]]==undefined)?null:value[key[i]]);
            }
            return ret;
         }else{
            return value;
         }
      }
   }
   return false;
}
function email(user,domain){
   document.write('<a href="mailto:'+user+'@'+domain+'">'+user+'@'+domain+'</a>');
}
$(document).ready(function(){
   // Make external links open in a new window.
   $('a.external').click(function(e){
      var nwin = window.open($(this).attr('href'), '_blank');
      nwin.focus();
      e.preventDefault();
   });
   // Make external forms submit to a new window.
   $('form.external').submit(function(e){
      var nwin = window.open($(this).attr('href'), 'smcForm');
      $(this).attr('target','smcForm');
   });
   $('map[name=cubemap] area').click(function(e){
      seen_instructions = true;
      var facet = $(this).attr('href').replace('#','').toLowerCase();
      if (facet[1] == '5'){
         current_color = facet[0].toUpperCase();
         $('#selected-color').removeClass('sc-u sc-r sc-f sc-d sc-l sc-b').addClass('sc-'+facet[0]);
         dataSave('current_color',current_color);
      }else{
         if (facet != ''){
            $(this)
             .parents('div.rubiks-cube')
             .setFacets(facet,current_color,true)
            
            cubeHistory(cubeState());
         }
      }
      e.preventDefault();
   });
   $('#instructions').click(function(){
      $(this).fadeOut(500);
      dataSave('seen_instructions',true);
   });
   $('.clearcube').click(function(e){
      clearCube();
      cubeHistory(cubeState());
      e.preventDefault();
   });
   $('.resetcube').click(function(e){
      resetCube();
      cubeHistory(cubeState());
      e.preventDefault();
   });
   $('.solvecube').click(function(e){
      //solveCube();
      var cube_state = cubeState();
      var edge_valid = cubeEdgePolarity(cube_state);
      var corner_valid = cubeCornerPolarity(cube_state);
      console('Edges valid? '+(edge_valid?'yes':'no')
       +' -- Corners valid? '+(corner_valid?'yes':'no'),2);
      $('.cube-solutions ul li.none:visible').slideUp(500,function(){
         $(this).find('em').text('There are no solutions, you removed them all.');
      });
      $('.cube-solutions ul').append('<li>'+$('#snip-solution').html()+'</li>')
       .scrollTop($('.cube-solutions ul').attr('scrollHeight'));
      var img = $('.cube-solutions ul li:last img:first');
      img.attr('src','spv.php?'+cube_state);
      $('.cube-solutions ul li:last .solution-actions').hide();
      execute('solve '+cube_state,function(reply){
         var solution = reply;
         $('.cube-solutions ul li:last .solution').html(solution);
         if (reply.match(/(?:[URFDLB][2\']?)(?:\s+[URFDLB][2\']?)+/)){
            $('.cube-solutions ul li:last .solution-actions').show();
         }else{
            $('.cube-solutions ul li:last .solution-fail-actions').show();
         }
         $('.cube-solutions ul').scrollTop($('.cube-solutions ul').attr('scrollHeight'));
      });
      e.preventDefault();
   });
   $('#cube-run').submit(function(e){
      cubeHistory(cubeState(cubeExecute($('#run-moves').val())));
      if ($('#run-clear').is(':checked')) $('#run-moves').val('');
      e.preventDefault();
   });
   $('.cube-colors li a').click(function(e){
      if (cubeState().indexOf('_') == -1){
         var trn = $(this).text().toUpperCase();
         cubeState(cubeTurn(trn));
         console('Executed '+trn+' turn.',2);
      }else{
         console('Error: There can not be any missing facets when performing a turn.',1);
      }
      e.preventDefault();
   });
   $('.cube-randplacement').click(function(e){
      $(document).xmodal({
         title:'Random Placement',
         html:'<p><strong class="bad">NOTICE: Randome placement is a highly experimental feature.</strong></p><p>While it will not cause severe problems, it will however return with unsolvable cubes roughly a quarter of the time.</p><p>This feature will scramble a cube by randomly placing each "cubie" with random position and orientation. About 25 or more random moves will suffice to getting a comparable result.</p><p><em>This feature will be dropped at the end of this public beta.</em></p>',
         width:450,
         height:180,
         type:'alert'
      });


      e.preventDefault();
   });
   $('.cube-shortcuts').click(function(e){
      $(document).xmodal({
         title:'Defined Shortcuts',
         html:'<dl>'
            +'<dt>Q / Shift+Q</dt><dd>(U/U\') Rotate the UP face 90&deg; <abbr title="clockwise/counterclockwise">CW/CCW</abbr>.</dd>'
            +'<dt>W / Shift+W</dt><dd>(R/R\') Rotate the RIGHT face 90&deg; CW/CCW.</dd>'
            +'<dt>E / Shift+E</dt><dd>(F/F\') Rotate the FRONT face 90&deg; CW/CCW.</dd>'
            +'<dt>A / Shift+A</dt><dd>(D/D\') Rotate the DOWN face 90&deg; CW/CCW.</dd>'
            +'<dt>S / Shift+S</dt><dd>(L/L\') Rotate the LEFT face 90&deg; CW/CCW.</dd>'
            +'<dt>D / Shift+D</dt><dd>(B/B\') Rotate the BACK face 90&deg; CW/CCW.</dd>'
            +'</dl><dl>'
            +'<dt>Ctrl+Z</dt><dd>Undo a change to the cube.</dd>'
            +'<dt>Ctrl+Y</dt><dd>Redo a change to the cube.</dd>'
            +'</dl>',
         width:500,
         height:240,
         type:'alert'
      });


      e.preventDefault();
   });
   $('#cube-scramble').submit(function(e){
      $('.scramblecube').click();
      e.preventDefault();
   });
   $('.scramblecube').click(function(e){
      if ($('#scramble-rand').is(':checked')){
         cubeHistory(cubeState(cubeRandom()));
      }else{
         var sides = ['U','R','F','D','L','B','U\'','R\'','F\'','D\'','L\'','B\'','U2','R2','F2','D2','L2','B2'];
         var cs = cube_state_clean;
         var trns = new Array();
         var depth = parseInt($('#scramble-depth').val());
         dataSave('scramble_depth',depth);
         for (i=0;i<depth;i++){
            do{
               var trn = sides[Math.floor(Math.random()*sides.length)];
            }while (
               (trns.length > 0 && trns[trns.length-1][0] == trn[0]) ||
               (trns.length > 1 && trns[trns.length-2][0] == trn[0] && (
                  (trns[trns.length-1][0] == 'U' && trn[0] == 'D') ||
                  (trns[trns.length-1][0] == 'R' && trn[0] == 'L') ||
                  (trns[trns.length-1][0] == 'F' && trn[0] == 'B') ||
                  (trns[trns.length-1][0] == 'D' && trn[0] == 'U') ||
                  (trns[trns.length-1][0] == 'L' && trn[0] == 'R') ||
                  (trns[trns.length-1][0] == 'B' && trn[0] == 'F')
               ))
            );
            cs = cubeTurn(trn,cs);
            trns.push(trn);
         }
         console('Executed random turns: '+trns.join(' '),2);
         cubeHistory(cubeState(cs));
      }
      e.preventDefault();
   });
   $('.cube-explain').live('click',function(e){
      //console('Notice: This feature is not available yet. Please try again at a later time.');
      var perm = $(this).parents('li').find('img.spv').attr('src').replace(/^.*\?/,'');
      var moves = $(this).parents('li').find('.solution').text().split(' ');
      var perms = [];
      var allmoves = [];
      var curperm = perm;
      for (var i in moves){
         perms.push(curperm);
         curperm = cubeTurn(moves[i],curperm);
         allmoves.push('<a href="#explain-move-'+i+'" id="explain-move-'+i+'">'+moves[i]+'</a>');
      }
      allmoves = allmoves.join(' ');
      $(document).xmodal({
         title:'Explanation',
         html:'<div id="explain-allmoves">'+allmoves+'</div><div id="explain-img"><img src="cg/loading.png" width="312" height="307" alt="" /></div><p id="explain-nav"><a href="#explain-prev" id="explain-prev">&lt;- Prev</a> | <a href="#explain-next" id="explain-next">Next -&gt;</a></p><p id="explain-what"><span id="explain-move"></span><br />Move <span id="explain-step">?</span> of '+(moves.length)+'</p><p><span id="explain-text">...</span></p>',
         width:600,
         height:330,
         type:'alert',
         onload:function(){
            $('#xmodal-body img').data({
               url1:'cg/?p=',
               url2:'&t=',
               perms:perms,
               moves:moves,
               id:0,
               set:function(id){
                  var idata = $('#explain-img img:first').data();
                  $('#explain-img img.active').remove();
                  $('#explain-img img:first')
                   .clone(false)
                   .appendTo('#explain-img')
                   .attr('src',idata.url1+idata.perms[id]+idata.url2+escape(idata.moves[id]))
                   .addClass('active');
                  $('#explain-img img:first').data('id',id);
                  $('#explain-allmoves a').removeClass('active');
                  $('#explain-move-'+id).addClass('active');
                  $('#explain-step').text(parseInt(id)+1);
                  $('#explain-move').text(idata.moves[id]);
                  $('#explain-text').text(move_des[idata.moves[id][0]][((idata.moves[id][1]=='\'')?1:((idata.moves[id][1]=='2')?2:0))]);
                  $('#explain-nav a').removeClass('disabled');
                  if (id == 0) $('#explain-prev').addClass('disabled');
                  if (id == idata.moves.length-1) $('#explain-next').addClass('disabled');
               }
            });
            $('#explain-prev').click(function(e){
               var idata = $('#explain-img img:first').data();
               if (idata.id > 0){
                  idata.set(idata.id-1);
               }
               e.preventDefault();
            });
            $('#explain-next').click(function(e){
               var idata = $('#explain-img img:first').data();
               if (idata.id < idata.moves.length-1){
                  idata.set(idata.id+1);
               }
               e.preventDefault();
            });
            $('#explain-allmoves a').click(function(e){
               var idata = $('#explain-img img:first').data();
               var moveid = $(this).attr('id').split('-');
               idata.set(parseInt(moveid[2]));
               e.preventDefault();
            });
            var idata = $('#explain-img img:first').data();
            idata.set(0);
         }
      });


      e.preventDefault();
   });
   $('.cube-restore').live('click',function(e){
      cubeHistory(cubeState($(this).parents('li').find('img.spv').attr('src').replace(/^.*\?/,'')));
      e.preventDefault();
   });
   $('.cube-load').live('click',function(e){
      $('#run-moves').val($(this).parents('li').find('.solution').text());
      e.preventDefault();
   });
   $('.cube-execute').live('click',function(e){
      cubeHistory(cubeState(cubeExecute($(this).parents('li').find('.solution').text())));
      e.preventDefault();
   });
   $('.cube-remove').live('click',function(e){
      $(this).parents('li').slideUp(500,function(){
         $(this).remove();
      });
      if ($('.cube-solutions ul li').length < 3){
         $('.cube-solutions ul li.none').slideDown(500);
      }
      e.preventDefault();
   });
   $('.cube-retry').live('click',function(e){
      var item = $(this).parents('li');
      item.find('.solution').html('Retrying...');
      item.find('.solution-fail-actions').hide();
      execute('solve '+cube_state,function(reply){
         var solution = reply;
         item.find('.solution').html(solution);
         if (reply.match(/(?:[URFDLB][2\']?)(?:\s+[URFDLB][2\']?)+/)){
            item.find('.solution-actions').show();
         }else{
            item.find('.solution-fail-actions').show();
         }
         $('.cube-solutions ul').scrollTop($('.cube-solutions ul').attr('scrollHeight'));
      });
      e.preventDefault();
   });
   $('.spv').live('mouseenter',function(e){
      var pvi = $(this).attr('src');
      var offset = $(this).offset();
      //alert(pvi);
      $('#pv-magnify')
       .data('origin',{x:offset.left+magnify,y:offset.top+magnify,w:$(this).width(),h:$(this).height()})
       .html('<img src="'+pvi+'" width="'+Math.round(67*magnify)+'" height="'+Math.round(49*magnify)+'" />')
       .stop(true,true)
       .show();
      $('#pv-magnify img').css('position','relative');
      e.preventDefault();
   });
   $('#console-input').submit(function(e){
      var q = $('#console-input input').val().replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      if (q != ''){
         consoleHist(q,true);
         execute(q);
      }else{
         consoleHist(0,true);
      }
      $('#console-input input').val('');
      e.preventDefault();
   })[0].setAttribute('autocomplete','off');
   $('#console-toggle').click(function(e){
      if ($(this).parent().hasClass('open')){
         closeConsole();
      }else{
         openConsole();
      }
      e.preventDefault();
   });
   $('#console-expand').click(function(e){
      if ($(this).parent().hasClass('open')){
         expandConsole();
      }
      e.preventDefault();
   });
   $('#page-addserver form input[type=submit]').attr('disabled','disabled');
   $('#page-addserver form input[name=srv_ipaddr]').focus(function(){
      $('#ip-info,#port-info').removeClass('valid');
   }).blur(function(e){
      $('#page-addserver form input[type=submit]').attr('disabled','disabled');
      var ipaddr = $(this).val();
      var port = $('#page-addserver form input[name=srv_port]').val();
      $('#ip-info').text('Checking...').removeClass('good bad valid');
      execute('iptest '+ipaddr,function(reply){
         if (reply.substr(0,2) == 'OK'){
            var ipinfo = reply.replace(/^OK\s+/i, '').split(',');
            $('#ip-info').html('<img src="img/flag/'+ipinfo[2].toLowerCase()+'.png" width="16" height="11" alt="'+ipinfo[2]+' flag" /> '+ipinfo[0]+', '+ipinfo[1]).addClass('good valid');
            if (port.match(/^\d{1,5}$/)){
               $('#port-info').text('Checking...').removeClass('good bad');
               execute('server test '+ipaddr+':'+port,function(reply){
                  if (reply.substr(0,2) == 'OK'){
                     var ipinfo = reply.replace(/^OK\s+/i, '').split(',');
                     $('#port-info').text('OK').addClass('good valid');
                     $('#page-addserver form input[type=submit]').attr('disabled','');
                  }else{
                     $('#port-info').text('Failed.').addClass('bad');
                  }
               });
            }
         }else{
            $('#ip-info').text('Invalid IP address, please try again.').addClass('bad');
         }
      });
   });
   $('#page-addserver form input[name=srv_port]').focus(function(){
      $('#port-info').removeClass('valid');
   }).blur(function(e){
      $('#page-addserver form input[type=submit]').attr('disabled','disabled');
      var ipaddr = $('#page-addserver form input[name=srv_ipaddr]').val();
      $('#port-info').text('Checking...').removeClass('good bad valid');
      execute('server test '+ipaddr+':'+$(this).val(),function(reply){
         if (reply.substr(0,2) == 'OK'){
            var ipinfo = reply.replace(/^OK\s+/i, '').split(',');
            $('#port-info').text('OK').addClass('good valid');
            $('#page-addserver form input[type=submit]').attr('disabled','');
         }else{
            $('#port-info').text('Failed.').addClass('bad');
         }
      });
   });
   $('a.cancel').click(function(e){
      var at = location.href; history.back();
      if (location.href == at) $.history.load($(this).attr('href').substr(1));
      e.preventDefault();
   });
   $('#page-addserver form').submit(function(e){
      var val = {};
      var inval = $(this).serializeArray();
      
      for (i in inval){
         val[inval[i].name] = inval[i].value.replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/"/, '');
      }
      
      var err = '';
      if (!($('#ip-info').hasClass('valid') && $('#port-info').hasClass('valid'))){
         err = console('Notice: Server IP and/or port are not validated yet.');
      }else if (val.srv_ipaddr == ''){
         err = console('Notice: You must enter the IP address of your server.');
      }else if (!val.srv_ipaddr.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)){
         err = console('Notice: The IP address you entered doesn\'t look like a valid IP address.');
      }else if (val.srv_port == ''){
         err = console('Notice: You must enter the port of your server.');
      }else if (!val.srv_port.match(/^\d{1,5}$/)){
         err = console('Notice: The port you entered doesn\'t look like a valid port.');
      }else{
         var cmd = 'server add '
            +val.srv_ipaddr
            +':'+val.srv_port;
         if (val.srv_name != undefined && val.srv_name != '')
            cmd += ' name="'+val.srv_name+'"';
         if (val.usr_name != undefined && val.usr_name != '')
            cmd += ' user="'+val.usr_name+'"';
         if (val.usr_email != undefined && val.usr_email != '')
            cmd += ' email="'+val.usr_email+'"';
         execute(cmd,function(reply){
            if (reply.substr(0,2) == 'OK'){
               $.history.load('addserverdone');
            }else{
               err = console('Error: Sorry, I had trouble adding your server. Please try again later.');
            }
         });
      }
      if (err.length){
         $(document).xmodal({
            title:err.replace(/^([^:]+):.*$/,'$1'),
            html:err.replace(/^[^:]+:\s*/,''),
            width:250,
            height:40,
            type:'alert'
         });
      }
      e.preventDefault();
   });
   $('#page-addserver .overlay-fg input.done').click(function(e){
      $('.overlay-fg').fadeOut(300,function(){
         $('.overlay-bg').fadeOut(300,function(){
            $('#page-addserver').fadeOut(300,function(){
               $('#page-cube').fadeIn(300);
            });
         });
      });
      e.preventDefault();
   });
   $('#console-input input').bind('keydown', 'up', function(e){
      var hist = consoleHist(-1);
      $('#console-input input').val(hist);
      return false;
   }).bind('keydown', 'down', function(e){
      var hist = consoleHist(1);
      $('#console-input input').val(hist);
      return false;
   }).bind('keyup', function(e){
      consoleHist($('#console-input input').val());
   });
   $.history.init(function(hash){
      if (hash == '') hash = 'solver';
      else if (hash[0] == '/') hash = hash.substr(1);
      $('.page').slideUp(200);
      $('#page-'+hash).slideDown(200);
      $('#menu li.active').removeClass('active');
      $('#menu li:has(a[href=\'#'+hash+'\'])').addClass('active');
      document.title = $('#page-'+hash+' h2:first').text()+' - '+$('h1:first').text();
   });
   $('#run-clear').change(function(){
      run_clear = $(this).is(':checked');
      dataSave('run_clear',run_clear);
   });
   $('#keyboard').change(function(){
      use_keyb = $(this).is(':checked');
      dataSave('use_keyb',use_keyb);
   });
   $(document).bind('keyup', 'q', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('U')));
      return false;
   }).bind('keyup', 'w', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('R')));
      return false;
   }).bind('keyup', 'e', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('F')));
      return false;
   }).bind('keyup', 'a', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('D')));
      return false;
   }).bind('keyup', 's', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('L')));
      return false;
   }).bind('keyup', 'd', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('B')));
      return false;
   }).bind('keyup', 'Shift+q', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('U\'')));
      return false;
   }).bind('keyup', 'Shift+w', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('R\'')));
      return false;
   }).bind('keyup', 'Shift+e', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('F\'')));
      return false;
   }).bind('keyup', 'Shift+a', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('D\'')));
      return false;
   }).bind('keyup', 'Shift+s', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('L\'')));
      return false;
   }).bind('keyup', 'Shift+d', function(e){
      if (use_keyb) cubeHistory(cubeState(cubeTurn('B\'')));
      return false;
   }).bind('keyup', 'Ctrl+z', function(e){
      if (use_keyb) cubeState(cubeHistory(-1));
      return false;
   }).bind('keyup', 'Ctrl+y', function(e){
      if (use_keyb) cubeState(cubeHistory(1));
      return false;
   });
   // Load cookies
   var cookie = dataLoad();
   use_keyb = (cookie.use_keyb != undefined && cookie.use_keyb == 'true');
   run_clear = (cookie.run_clear != undefined && cookie.run_clear == 'true');
   if (cookie.scramble_depth != undefined) scramble_depth = cookie.scramble_depth;
   seen_instructions = (cookie.seen_instructions != undefined && cookie.seen_instructions == 'true');
   if (cookie.current_color != undefined) current_color = cookie.current_color;
   if (run_clear != $('#run-clear').is(':checked'))
      $('#run-clear').attr('checked',run_clear?'checked':'');
   if (use_keyb != $('#keyboard').is(':checked'))
      $('#keyboard').attr('checked',run_clear?'checked':'');
   $('#scramble-depth').val(scramble_depth);
   if (!seen_instructions) setTimeout('if (!seen_instructions){$(\'#instructions\').fadeIn(1000);}',5000);
   cubeHistory(clearCube());
   $('#selected-color').addClass('sc-'+current_color.toLowerCase());
   //openConsole();
}).mousemove(function(e){
   if ($('#pv-magnify img').length){
      var o = $('#pv-magnify').css({left:e.pageX,top:e.pageY}).data('origin');
      $('#pv-magnify img').css({left:-((e.pageX-o.x)*magnify),top:-((e.pageY-o.y)*magnify)});
      if (e.pageX < o.x-(magnify*2) || e.pageX > o.x+o.w ||
         e.pageY < o.y-(magnify*2) || e.pageY > o.y+o.h){
         $('#pv-magnify').stop(true,true).html('').removeData('origin').hide();
      }
   }
});
