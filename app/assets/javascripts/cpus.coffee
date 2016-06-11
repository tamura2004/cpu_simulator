# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://coffeescript.org/

$(document).on "ready page:loag", ->
  $("textarea#cpu_message").animate
    scrollTop: $("textarea#cpu_message")[0].scrollHeight - $("textarea#cpu_message").height()
  , 1000