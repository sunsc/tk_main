class ProjectAdministratorsController < ApplicationController
  layout 'new_user'

  before_action :authenticate_user!
  before_action :read_papers, only: [:my_paper]
 
  def my_home
  end

  def my_paper
    subject_arr = Mongodb::BankPaperPap.get_column_arr(@papers_filter, "subject").sort{|a,b| Common::Locale.mysort(Common::Subject::Order[a.nil?? "":a.to_sym],Common::Subject::Order[b.nil?? "":b.to_sym]) }
    @subjects = deal_label('dict', subject_arr)

    grade_arr = Mongodb::BankPaperPap.get_column_arr(@papers_filter, "grade").sort{|a,b| Common::Locale.mysort(Common::Grade::Order[a.nil?? "":a.to_sym],Common::Grade::Order[b.nil?? "":b.to_sym]) }
    @grades = deal_label('dict', grade_arr)
 
    status_arr = Mongodb::BankPaperPap.get_column_arr(@papers_filter,"paper_status").sort{|a,b| Common::Locale.mysort(Common::Locale::StatusOrder[a.nil?? "":a.to_sym],Common::Locale::StatusOrder[b.nil?? "":b.to_sym]) }
    @status = deal_label('papers.status', status_arr)
 
    province, city, district = params[:region].split('/') unless params[:region].blank?
    @region = params[:region]#deal_label('area', params[:region].split('/')).join('/') unless params[:region].blank?

    @papers = @papers_data.by_grade(params[:grade])
      .by_subject(params[:subject])
      .by_status(params[:paper_status])
      .by_keyword(params[:keyword])
      .by_province(province)
      .by_city(city)
      .by_district(district)
      .page(params[:page])
      .per(10)
      .only(Common::Page::PaperListLeastAttributes)
  end

  private

  def read_papers
    #查询关联测试列表
    tests = Mongodb::BankTest.by_user(current_user.id)
    #查看相关试卷id
    pap_ids = tests.map{|t| t.bank_paper_pap.id.to_s if (t && t.bank_paper_pap) }.compact
    #初步过滤试卷范围
    @papers_filter = { 
      id: {'$in'=>pap_ids} 
    }
    @papers_data = Mongodb::BankPaperPap.where(@papers_filter).order({dt_update: :desc})
  end
end
