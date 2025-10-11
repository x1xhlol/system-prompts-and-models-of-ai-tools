require 'rails'
require 'sprockets/railtie'

module Speakingurl
  module Rails
    class Railtie < ::Rails::Railtie
      initializer "speakingurl_rails.append_path", :group => :all do |app|
        speakingurl_path =  File.expand_path('../', __FILE__)
        sprockets_env = app.assets || Sprockets
        sprockets_env.prepend_path(speakingurl_path.to_s)
      end
    end
  end
end
