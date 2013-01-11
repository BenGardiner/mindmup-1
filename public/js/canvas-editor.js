$(function(){
  var mapModel; 
  var initCanvas=function(idea){
    var stage = new Kinetic.Stage({
      container: 'container',
        width: $(window).width(),
        height: $(window).height(),
    }),
dimensionProvider = function (title) {
  var text = new Kinetic.Idea({
    text: title
  });
  return {
    width: text.getWidth(),
height: text.getHeight()
  };
};

mapModel = new MAPJS.MapModel(function layoutCalculator(idea) {
  return MAPJS.calculateLayout(idea, dimensionProvider);
});
var mediator = new MAPJS.KineticMediator(mapModel, stage);
mapModel.setIdea(idea);
}
var attachTooltips=function(){
  _.each($('[rel=tooltip]'),function(item){ $(item).tooltip({placement:'bottom',title:$(item).attr('title')})});
}
var attach_menu_listeners=function(active_content,selectedId){
  var changed=false;
  var publishMap = function(result) {
    var publishTime=Date.now();
    logMapActivity('Publish',result.key);
    $("#s3form [name='file']").val("window.map=" + JSON.stringify(active_content));
    for (var name in result) {$('#s3form [name='+name+']').val(result[name])};
    $('#s3form').submit();
  }
  active_content.addEventSink(function() {
    if (!changed) {
      $("#toolbarShare").hide();
      $("#toolbarSave").show();
      logMapActivity('Edit');
      changed = true;
    }
    logUserActivity(_.toArray(arguments));
  });
  $('#menuAdd').click(mapModel.addSubIdea.bind(mapModel, 'double click to edit'));
  $('#menuEdit').click(mapModel.editNode);
  $('#menuDelete').click(mapModel.removeSubIdea);
  $('#menuClear').click(mapModel.clear);
  $("#menuPublish").click(function(){
    $.getJSON("/publishingConfig", publishMap);
  });
}
function updateTitle(newTitle){
  document.title=newTitle;
  $('.st_btn').attr('st_title',newTitle);
  $('.brand').text(newTitle);
}
var load_content = function (jsonDocument) {
  var idea = content(jsonDocument);
  initCanvas(idea);
  attach_menu_listeners(idea,function(){/* somehow get selected id*/ return idea.id});
  logMapActivity('View');
  updateTitle(idea.title);
};
load_content(window.map);
attachTooltips();
});