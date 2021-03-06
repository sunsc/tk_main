# -*- coding: UTF-8 -*-

class Wx::PapersController < ApplicationController
  skip_before_action :verify_authenticity_token
  before_action :wx_authenticate!, :except => [:get_quizs, :submit_quiz_score]
  before_action :wx_set_api_header

  def get_quizs
  	params.permit!

    status = 403
    data = {}

  	if params[:wx_openid].blank?
  	  status = 500
      data = {message: Common::Locale::i18n("wx_users.messages.warn.not_wx_user")}
  	elsif params[:grade].blank? || params[:term].blank? || params[:subject].blank?
  	  status = 400
      data = {message: Common::Locale::i18n("wx_commons.messages.warn.invalid_params")}
    else
      params_h ={
      	:grade => params[:grade],
      	:term => params[:term],
      	:subject => params[:subject]
      }
#      current_paper = Mongodb::BankPaperPap.get_a_paper params_h
      current_paper = Mongodb::BankPaperPap.where(_id: "578c8579980146652f56a3a8").first || Mongodb::BankPaperPap.get_a_paper(params_h)
      if current_paper
        paper_h = JSON.parse(current_paper.paper_json)
        # 临时处理，待流程整理后处理
        paper_h["paper_html"] = ""
        paper_h["answer_html"] = ""
        paper_h["paper"]["paper_html"] = ""
        paper_h["paper"]["answer_html"] = ""
        status = 200
        data = {paper_json: paper_h.to_json, message: Common::Locale::i18n("wx_commons.messages.info.get_success")}
      else
      	status = 400
        data = {message: Common::Locale::i18n("wx_papers.messages.info.no_paper")}
      end
    end

  	render common_json_response(status, data)
  end

  def submit_quiz_score
    params.permit!
    status = 403
    data = {}

  	if params[:wx_openid].blank?
  	  status = 500
  	  data = {message: Common::Locale::i18n("wx_users.messages.warn.not_wx_user")}
  	elsif params[:bank_quiz_qizs].blank?
  	  status = 400
  	  data = {message: Common::Locale::i18n("wx_scores.messages.warn.no_quizs")}
    else
      begin
      	#未来视情况作JOB处理
      	#保存成绩
        Mongodb::OnlineTest.where({:wx_openid=> params[:wx_openid],:pap_uid => params[:pap_uid]}).destroy_all
      	target_mot = Mongodb::OnlineTest.new({
      	  :pap_uid => params[:pap_uid],
      	  :user_id => wx_current_user.nil?? "" : wx_current_user.id,
      	  :wx_openid => params[:wx_openid],
      	  :result_json => params.to_json 
      	})
      	raise SwtkErrors::SaveOnlineTestError.new(Common::Locale::i18n("online_tests.messages.error.save_failed")) unless target_mot.save

        #录入得分点
        #删除同一试卷的旧得分点
        Mongodb::MobileUserQizpointScore.where({:wx_openid => params[:wx_openid], :pap_uid => params[:pap_uid]}).destroy_all
        Mongodb::MobileUserQizpointScore.save_score params
        #分析成绩
        #Mongodb::MobileReportTotalAvgResult.where({'_id.wx_openid' => params[:wx_openid], '_id.pap_uid' => params[:pap_uid]}).destroy_all
        Mongodb::MobileReportTotalAvgResult.destroy_all
        #Mongodb::MobileReportBasedOnTotalAvgResult.where({'_id.wx_openid' => params[:wx_openid], '_id.pap_uid' => params[:pap_uid]}).destroy_all
        Mongodb::MobileReportBasedOnTotalAvgResult.destroy_all
        #Mongodb::PupilMobileReport.where({'_id.wx_openid' => params[:wx_openid], '_id.pap_uid' => params[:pap_uid]}).destroy_all
        Mongodb::PupilMobileReport.destroy_all
        pupil = wx_current_user.nil?? nil : wx_current_user.pupil
        mobile_report_generator = Mongodb::MobileUserReportGenerator.new({
            :pap_uid => params[:pap_uid],
#            :pup_uid => pupil.nil?? "" : pupil.uid,
            :wx_openid => params[:wx_openid]
        })
        
        mobile_report_generator.cal_ckp_total_avg
        mobile_report_generator.add_avg_col
        mobile_report_generator.cal_based_on_total_avg
        mobile_report_generator.construct_simple
        mobile_report_generator.construct_ckp_charts
        mobile_report_generator.construct_weak_ckps
        mobile_report_generator.construct_knowledge_weak_ckps

        #获取报告id
        if pupil.nil?
          rparams = {
            :pap_uid => params[:pap_uid],
            :wx_openid => params[:wx_openid]
          }
        else
          rparams ={
            :pap_uid => params[:pap_uid],
            :pup_uid => pupil.uid,
            :wx_openid => params[:wx_openid]
          }
        end
        mobile_report = Mongodb::PupilMobileReport.where(rparams).first
        raise unless mobile_report

        status = 200
        data = {report_id: mobile_report._id.to_s, message: Common::Locale::i18n("wx_scores.messages.info.save_success")}
      rescue Exception => ex
      	status = 500
        logger.info("=====试卷提交过程中发生异常message：#{ex.message}")
        logger.info("=====试卷提交过程中发生异常bactrace：#{ex.backtrace}")
      	data = {message: Common::Locale::i18n("wx_scores.messages.error.save_exception")}
      end
    end

    render common_json_response(status, data)
  end
end
