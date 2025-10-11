require 'json'

package_path = File.expand_path('../package.json', __FILE__)
package_json = JSON.parse(File.read(package_path))

Gem::Specification.new do |s|
  s.name = "speakingurl-rails"
  s.version = package_json["version"]
  s.platform  = Gem::Platform::RUBY
  s.author = "Sascha Droste"
  s.metadata = { "contributor" => "Josef Šimánek <https://github.com/simi>" }
  s.email = ["pid@posteo.net"]
  s.homepage  = "http://pid.github.io/speakingurl/"
  s.summary  = "Speakingurl for Rails asset pipeline"
  s.description = "Generate a slug – transliteration with a lot of options"
  s.license  = "BSD"

  s.add_dependency "railties", [">= 3.1"]

  s.files = %w(README.md LICENSE lib/speakingurl-rails.rb lib/speakingurl.js)

  s.require_paths = ["lib"]
end
