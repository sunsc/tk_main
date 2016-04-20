class BankNodestructure < ActiveRecord::Base
  self.primary_key = "uid"

  include ActiveRecordPatch
  before_create :set_create_time_stamp
  before_save :set_update_time_stamp

  before_create :init_uid

  has_many :bank_tbc_ckps
  has_many :bank_checkpoint_ckps, through: :bank_tbc_ckps

  private
  def init_uid
    self.uid=Time.now.to_snowflake.to_s
  end
end
