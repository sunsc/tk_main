# -*- coding: UTF-8 -*-

require 'thwait'

class Mongodb::ReportGroupGenerator
  include Mongoid::Document
  code_file = Rails.root + "config/initializers/patches/mongodb_report_group_generator_patch.txt"
  begin
    eval(TkEncryption::codes_str_decryption(code_file))
  rescue Exception => ex
    #
  end   
end