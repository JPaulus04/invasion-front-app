Pod::Spec.new do |s|
  s.name = 'LscGameCenter'
  s.version = '1.0.0'
  s.summary = 'Game Center bridge for Last Stand Command'
  s.license = 'UNLICENSED'
  s.homepage = 'https://example.invalid/last-stand-command'
  s.author = 'Last Stand Command'
  s.source = { :path => '.' }
  s.source_files = 'ios/Sources/**/*.{swift,h,m,c,cc,mm,cpp}'
  s.ios.deployment_target = '15.0'
  s.dependency 'Capacitor'
  s.framework = 'GameKit'
  s.swift_version = '5.1'
end
