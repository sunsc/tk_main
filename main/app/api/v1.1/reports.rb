# -*- coding: UTF-8 -*-

module Reports
  class API < Grape::API
    version 'v1.1', using: :path #/api/v1/<resource>/<action>
    format :json
    prefix :api

    helpers ApiHelper

    resource :reports do
      before do
        wx_set_api_header
        wx_authenticate!
      end

      #
      desc ''
      params do

      end
      post :list do
        if wx_current_user.is_pupil?
          target_papers = wx_current_user.role_obj.papers
        end
        unless target_papers.blank?
          target_papers.map{|target_pap|
            next unless target_pap
            if target_pap.bank_tests.blank?
              target_report = Mongodb::PupilReport.where(pup_uid: target_pap.id.to_s).first
              rpt_h = JSON.parse(item.report_json)
              {
                :paper_heading => target_pap.heading,
                :subject => rpt_h["basic"]["subject"],
                :quiz_type => rpt_h["basic"]["quiz_type"],
                :quiz_date => rpt_h["basic"]["quiz_date"],
                :score => rpt_h["basic"]["score"],
                :value_ratio => rpt_h["basic"]["value_ratio"],
                :class_rank => rpt_h["basic"]["class_rank"],
                :grade_rank => rpt_h["basic"]["grade_rank"],
                :report_version => "000016090",
                :report_id => target_report._id.to_s,
                :dt_update => target_report.dt_update.strftime("%Y-%m-%d %H:%M")
              }
            else
              {
                :paper_heading => target_pap.heading,
                :subject => Common::Locale::i18n("dict.#{target_pap.subject}"),
                :quiz_type => Common::Locale::i18n("dict.#{target_pap.quiz_type}"),
                :quiz_date => target_pap.quiz_date.strftime('%Y/%m/%d'),
                :score => target_pap.score,
                :report_version => "00016110",
                :report_url => Common::ReportPlus::report_url(target_pap.bank_tests[0].id.to_s, wx_current_user)
              }
            end
          }
        else
          [{}]
        end
      end
    end

   end
end