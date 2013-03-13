#!/usr/bin/env ruby
require_relative 'setup.rb'
require 'json'

JS_CONFIG_PATH = File.join(SRC_LAB_PATH, 'lab.config.js')

# JS needs to know dataGamesProxyPrefix and ought to know hostname ("lab.dev.concord.org")

# AFAICT this information is only available ('hostname' command on the server does not yield useful
# info, and deducing the hostname from the URL at JS runtime is unreliable in the face of proxies,
# etc.)

SERVER_SETTINGS_PATH = File.join(PROJECT_ROOT, 'server', 'config', 'settings.yml')
if File.exist?(SERVER_SETTINGS_PATH)
  SERVER_SETTINGS = YAML.load_file(SERVER_SETTINGS_PATH)
  hostname = SERVER_SETTINGS['production'][:hostname]
  CONFIG[:jsconfig][:hostName] = hostname

  target = CONFIG[:deploy][:targets].find { |t| t[:url] == hostname }
  CONFIG[:jsconfig][:dataGamesProxyPrefix] = target[:dataGamesProxyPrefix] unless target == nil
end


# Provide default values for some values.
CONFIG[:jsconfig] = {} if CONFIG[:jsconfig] == nil

CONFIG[:jsconfig][:sharing] = true  if CONFIG[:jsconfig][:sharing] == nil
CONFIG[:jsconfig][:logging] = true  if CONFIG[:jsconfig][:logging] == nil
CONFIG[:jsconfig][:tracing] = false if CONFIG[:jsconfig][:tracing] == nil
CONFIG[:jsconfig][:authoring] = false if CONFIG[:jsconfig][:authoring] == nil
CONFIG[:jsconfig][:actualRoot] = "" if CONFIG[:jsconfig][:actualRoot] == nil
CONFIG[:jsconfig][:fontface] = "Open Sans" if CONFIG[:jsconfig][:fontface] == nil
CONFIG[:jsconfig][:dataGamesProxyPrefix] = "DataGames/Games/concord/lab/" if CONFIG[:jsconfig][:dataGamesProxyPrefix] == nil

jsconfig = <<HEREDOC
// this file is generated during build process by: ./script/generate-js-config.rb
define(function (require) {
  var actualRoot = require('common/actual-root'),
      publicAPI;
  publicAPI = #{JSON.pretty_generate(CONFIG[:jsconfig])};
  publicAPI.actualRoot = actualRoot;
  return publicAPI;
});
HEREDOC

File.open(JS_CONFIG_PATH, 'w') { |f| f.write jsconfig }

