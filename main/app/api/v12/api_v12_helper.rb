# -*- coding: UTF-8 -*-

require 'doorkeeper/grape/helpers'

module ApiV12Helper
  def set_api_header
    header 'Access-Control-Allow-Origin','*'
    header 'Access-Control-Request-Method', 'GET, POST, PUT, OPTIONS, HEAD'
    header 'Access-Control-Allow-Headers', 'x-requested-with,Content-Type, Authorization'    
  end

  def current_user
    target_user = User.where(id: doorkeeper_token.resource_owner_id).first if doorkeeper_token
    error!(message_json("e40004"), 404) unless target_user
    target_user
  end

  def not_user_token!
    error!("invalid token",400) unless doorkeeper_token.user.blank?
  end

  def current_tenant
    tenant = nil
    if current_user.is_project_administrator?
      tenant = nil
    else
      tenant = current_user.role_obj.tenant
    end
    tenant
  end

  # 获取登录的微信账户 
  def current_wx_user
    if params[:wx_openid]
      option_h = {
        :wx_openid => params[:wx_openid]
      }
    elsif params[:wx_unionid]
      option_h = {
        :wx_unionid => params[:wx_unionid]
      }
    else
      error!(message_json("e40400"), 400) unless target_wx_user
    end

    target_wx_user = WxUser.where(option_h).first
    unless target_wx_user
      begin
        target_wx_user = WxUser.new(option_h)
        target_wx_user.save!
      rescue Exception => ex
        error!(message_json("e41002"), 403) unless target_wx_user
      end
    end
    return target_wx_user
  end

  def get_online_test_user_link
    Mongodb::OnlineTestUserLink.where({
      online_test_id: params[:online_test_id],
      wx_user_id: current_wx_user.id
    }).first
  end

  def message_json code
    {
      code: code,
      message: I18n.t("api.#{code}")
    }
  end

end