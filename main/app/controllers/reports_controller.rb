# -*- coding: UTF-8 -*-

class ReportsController < ApplicationController
  # use job queue to create every report
  before_action :set_paper, only: [:generate_all_reports, :generate_reports, :new_square, :square_v1_1]
  before_action do
    check_resource_tenant(@paper) if @paper
  end

  def generate_all_reports
    logger.info("====================generate_all_reports: begin")
    params.permit!

    result = {:task_uid => ""}

    begin
      # Task info
      target_task = @paper.bank_tests[0].tasks.by_task_type(Common::Task::Type::CreateReport).first
      task_uid = target_task.nil?? "" :target_task.uid
      target_task.touch(:dt_update)

      # create a job
      Thread.new do
        GenerateReportJob.perform_later({
          :task_uid => task_uid,
          :province =>Common::Locale.hanzi2pinyin(@paper.tenant.area_pcd[:province_name_cn]),
          :city => Common::Locale.hanzi2pinyin(@paper.tenant.area_pcd[:city_name_cn]),
          :district => Common::Locale.hanzi2pinyin(@paper.tenant.area_pcd[:district_name_cn]),
          :school => Common::Locale.hanzi2pinyin(@paper.tenant.name_cn),
          :pap_uid => params[:pap_uid]}) 
      end

      status = 200
      result[:task_uid] = task_uid
    rescue Exception => ex
      status = 500
      result[:task_uid] = ex.message
    end
    logger.info("====================generate_all_reports: end")
    render common_json_response(status, result)  
  end

  def generate_reports
    Common::method_template_log_only(__method__.to_s()) {
      params.permit!

      result = {:task_uid => ""}

      begin
        # Task info
        target_task = @paper.bank_tests[0].tasks.by_task_type(Common::Task::Type::CreateReport).first
        task_uid = target_task.nil?? "" :target_task.uid        
        target_task.touch(:dt_update)

        @paper.bank_tests[0].update(:report_version => "1.1")
        @paper.update(paper_status: Common::Paper::Status::ReportGenerating)

        test_id = @paper.bank_tests[0].id

        #将数据分组建立job groups， monitoring job
        #job_groups = Common::ReportPlus::sigoto_siwake({ :task_uid => task_uid, :test_id => test_id.to_s, :top_group => "project"})

        # job_tracker = JobList.new({
        #   :name => Common::Job::Type::Monitoring,
        #   :task_uid => task_uid,
        #   :job_type => Common::Job::Type::Monitoring,
        #   :status => Common::Job::Status::NotInQueue,
        #   :process => 0
        # })
        # job_tracker.save!
        # if current_user.is_project_administrator?
        #   top_group = Common::Report::Group::Project
        # else
        #   top_group = Common::Report::Group::Grade
        # end
        Thread.new do
          GenerateReportsJob.perform_later({
            :test_id => test_id.to_s,
            :task_uid => task_uid,
            :top_group => Common::Report::Group::Project #进一步修改，默认项目,"project"
            # :job_uid => job_tracker.uid,
            # :job_groups => job_groups
          })
        end
        status = 200
        result[:task_uid] = task_uid
      rescue Exception => ex
        status = 500
        result[:task_uid] = ex.message
        logger.debug ">>>Exception!<<<"
        logger.debug ex.message
        logger.debug ex.backtrace
      end
      render common_json_response(status, result)  
    }
  end

  def get_grade_report
    params.permit!

    status = 403
    data = {}
    if params[:report_id].blank?
      status = 500
      data = {message: I18n.t("reports.messages.grade.get_report.failed")}
    else
      report_json = SwtkAliOss::response_report_url(SwtkAliOss::Const[:grade_report_bucket], params[:report_id])
      unless report_json.blank?
        status = 200
        data = {data: JSON.parse(report_json)}
      else
        status = 400
        data = {message: I18n.t("reports.messages.grade.get_report.failed")}
      end
    end
    render common_json_response(status, data)
  end

  def get_class_report
    params.permit!

    status = 403
    data = {}
    if params[:report_id].blank?
      status = 500
      data = {message: I18n.t("reports.messages.class.get_report.failed")}
    else
      report_json = SwtkAliOss::response_report_url(SwtkAliOss::Const[:class_report_bucket], params[:report_id])
      unless report_json.blank?
        status = 200
        data = {data: JSON.parse(report_json)}
      else
        status = 400
        data = {message: I18n.t("reports.messages.class.get_report.failed")}
      end
    end
    render common_json_response(status, data)
  end

  def get_pupil_report
    params.permit!
 
    status = 403
    data = {}
    if params[:report_id].blank?
      status = 500
      data = {message: I18n.t("reports.messages.pupil.get_report.failed")}
    else
      report_json = SwtkAliOss::response_report_url(SwtkAliOss::Const[:pupil_report_bucket], params[:report_id])
      unless report_json.blank?
        status = 200
        data = {data: JSON.parse(report_json)}
      else
        status = 400
        data = {message: I18n.t("reports.messages.pupil.get_report.failed")}
      end
    end
    render common_json_response(status, data)
  end

  def first_login_check_report
    params.permit!

    rum = ReportUrlMapping.where(:codes => params[:codes]).first
    first_flag = rum.first_login

    if first_flag
      redirect_to init_profile_path
      rum.update(:first_login => false)
      return
    end

    params_h = JSON.parse(rum.params_json)

    unless params_h.blank?
      redirect_to new_square_reports_path(:pap_uid=> params_h["pap_uid"])
    else
      render 'errors/error_403', status: 403,  layout: 'error'
    end

  end

  def new_square
    params.permit!

    current_paper = Mongodb::BankPaperPap.where(_id: params[:pap_uid]).first

    loc_h = {
      :province => Common::Locale.hanzi2pinyin(current_tenant.area_pcd[:province_name_cn]),
      :city => Common::Locale.hanzi2pinyin(current_tenant.area_pcd[:city_name_cn]),
      :district => Common::Locale.hanzi2pinyin(current_tenant.area_pcd[:district_name_cn]),
      :school => Common::Locale.hanzi2pinyin(current_tenant.name_cn),
      :grade => current_paper.grade
    }
    #grade_report = Mongodb::GradeReport.where(loc_h).first
    #@default_report_type = "grade"
    #@default_report_id = grade_report._id.to_s
    #@default_report_name = current_paper.heading + I18n.t("dict.ce_shi_zhen_duan_bao_gao")
    #@default_report_type = (current_paper.subject.nil?? I18n.t("dict.unknown") : I18n.t("dict.#{current_paper.subject}"))
    if  current_user.is_tenant_administrator? || current_user.is_analyzer?
      @scope_menus = Location.get_report_menus(Common::Role::Analyzer, params[:pap_uid], loc_h)
    elsif current_user.is_teacher?
      # 暂时将老师和分析员可查看范围一致
      # klass_rooms = current_user.teacher.locations.map{|loc| loc.classroom}
      # loc_h[:classroom] = klass_rooms
      @scope_menus = Location.get_report_menus(Common::Role::Teacher,params[:pap_uid], loc_h)
    elsif current_user.is_pupil?
      loc_h[:classroom] = [current_user.pupil.location.classroom]
      #@scope_menus = current_user.pupil.report_menu params[:pap_uid]
      @scope_menus = Location.get_report_menus(Common::Role::Pupil,params[:pap_uid], loc_h, {:pup_uid => current_user.pupil.uid} )
    else 
      @scope_menus = { 
        :key => "",
        :label => "",
        :report_url => "",
        :items => []}
    end
    render :layout => 'new_report'
  end

  def square_v1_1
    Common::method_template_log_only(__method__.to_s()) {
      params.permit!

      @test_id = @paper.bank_tests[0].id.to_s
      # begin
      #   # @init_menus = 
      #   #@scope_menus = Common::ReportPlus::report_nav_menus({:test_id => test_id, :top_group => params[:top_group]})
      # rescue Exception => ex
      #   #@scope_menus = []
      #   logger.debug ">>>Exception<<<"
      #   logger.debug ex.message
      #   logger.debug ex.backtrace
      # end
      render :layout => '00016110/report'
    }
  end

  def project
    render :layout => false
  end

  def grade
    render :layout => false
  end

  def klass
    render :layout => false
  end

  def pupil
    render :layout => false
  end

  private

  def set_paper
    @paper = Mongodb::BankPaperPap.find(params[:pap_uid])
    @paper.current_user_id = 4651#current_user.id
  end
end
