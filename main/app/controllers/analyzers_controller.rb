class AnalyzersController < ApplicationController
  layout 'user'

  before_action :authenticate_user!
  before_action :read_papers#, only: [:my_home, :my_paper]
 
  def my_home
    @analyzer = current_user.analyzer
    @papers_status_to_count = {}
    #@papers_data.group_by {|p| p.paper_status }.each do |k, v|
    #  @papers_status_to_count[k] = v.count
    #end
    filter = {
      :user_id => current_user.id
    }
    results = Mongodb::BankPaperPap.get_paper_status_count(filter)
    @papers_status_to_count = results
  end

  def region
    region = Mongodb::BankPaperPap.region(@papers_data)
    render json: region.to_json
  end

  def my_paper
    paper_data = @papers_data

    filter = {
      :user_id => current_user.id
    }
    subject_arr = paper_data.get_column_arr(filter, "subject").sort{|a,b| Common::Locale.mysort(Common::Subject::Order[a.nil?? "":a.to_sym],Common::Subject::Order[b.nil?? "":b.to_sym]) }
    @subjects = deal_label('dict', subject_arr)

    grade_arr = paper_data.get_column_arr(filter, "grade").sort{|a,b| Common::Locale.mysort(Common::Grade::Order[a.nil?? "":a.to_sym],Common::Grade::Order[b.nil?? "":b.to_sym]) }
    @grades = deal_label('dict', grade_arr)
 
    status_arr = paper_data.get_column_arr(filter,"paper_status").sort{|a,b| Common::Locale.mysort(Common::Locale::StatusOrder[a.nil?? "":a.to_sym],Common::Locale::StatusOrder[b.nil?? "":b.to_sym]) }
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
    render layout: "new_user" 
  end

  def my_log

  end

  private

  def read_papers
    @papers_data = Mongodb::BankPaperPap.by_user(current_user.id).order({dt_update: :desc})
  end
  
end
