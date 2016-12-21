# -*- coding: UTF-8 -*-

class GenerateOnlineTestReportsJob < ActiveJob::Base
  queue_as :default

  def self.perform_later(*args)
    Common::method_template_with_rescue(__method__.to_s()) {
      logger.info "#{args}"
      params = args[0]

      target_task = TaskList.where(uid: params[:task_uid]).first
      target_task.touch(:dt_update)
      job_tracker = target_task.job_lists.order(dt_update: :desc).first
      job_tracker.update(process: 0.05)

      ###########
      # 上传成绩, Begin
      target_paper = Mongodb::BankPaperPap.where(id: params[:pap_uid]).first

      # version 1.1
      # 等测试功能进入，再做更改, 默认一个试卷对应一个在线测试
      #
      # 若无，创建测试；有，返回测试对象
      if target_paper.online_tests.blank?
        target_online_test = Mongodb::OnlineTest.new({
          :name => target_paper.heading,
          :wx_user_id => params[:wx_user_id],
          :report_version => "1.1",
          :bank_paper_pap_id => target_paper.id
        })
        target_online_test.save!
      end
      target_online_test = target_paper.online_tests[0]
      raise SwtkErrors::NotFoundError.new(Common::Locale::i18n("swtk_errors.object_not_found", :message => "online test object")) unless target_online_test

      # 删除同一测试, 同一测试者的旧成绩
      score_filter = {
        :online_test_id=> target_online_test.id.to_s,
        :wx_user_id => params[:wx_user_id], 
        :pap_uid => params[:pap_uid]
      }
      Mongodb::BankTestScore.where(score_filter).destroy_all
      job_tracker.update(process: 0.1)

      # version 1.1
      # 为了兼容旧代码及数据
      #
      # 检查指标mapping，若未生成则生成
      target_paper_qzps = target_paper.bank_quiz_qizs.map{|qiz| qiz.bank_qizpoint_qzps}.flatten
      target_paper_qzps.each{|qzp|
        next if Common::valid_json?(qzp.ckps_json)
        qzp.format_ckps_json
      }
      qzps_ckps_mapping_h = {}
      target_paper_qzps.each{|qzp|
        qzps_ckps_mapping_h[qzp.id.to_s] = JSON.parse(qzp.ckps_json)
      }
      job_tracker.update(process: 0.15)

      # 保存各得分点成绩
      result_qzps = params[:results].map{|quiz| quiz[:bank_qizpoint_qzps] }.flatten
      result_qzps.each_with_index{|qzp, index|
        qizpoint = Mongodb::BankQizpointQzp.where(id: qzp[:id]).first
        next unless qizpoint

        test_score = 0
        if !qzp[:result].blank? && !qizpoint.answer.blank?
          test_result = qzp[:result].downcase.strip

          qizpoint_answer = qizpoint.answer.nil?? "" : qizpoint.answer.gsub(/<\/?[^>]*>/, "")
          if qizpoint_answer
            qizpoint_answer.gsub!(/[\\\n]/, "") 
            qizpoint_answer.downcase!
            qizpoint_answer.strip!
          end

          unless !test_result.blank? && !qizpoint_answer.blank?
            test_score = (test_result == qizpoint_answer) ? qizpoint.score : 0
          end
        end

        score_params = {
          :online_test_id=> target_online_test.id.to_s,
          :wx_user_id => params[:wx_user_id], 
          :pap_uid => params[:pap_uid],
          :qzp_uid => qizpoint.id.to_s,
          :order => qizpoint.order,
          :real_score => test_score,
          :full_score => qizpoint.score
        }
        # 得分点的知识，技能，能力的指标的相应信息
        qzp_ckp_h = qzps_ckps_mapping_h[qzp[:id]]
        qzp_ckp_h.each{|dimesion, ckps|
          score_params[:dimesion] = dimesion
          ckps.each{|ckp|
            score_params[:ckp_uids] = ckp.keys[0]
            score_params[:ckp_order] = ckp.values[0]["rid"]
            score_params[:ckp_weights] = ckp.values[0]["weights"]
            bank_test_score = Mongodb::BankTestScore.new(score_params)
            bank_test_score.save!
          }
        }
        job_tracker.update(process: 0.15 + index.to_f/result_qzps.size)
      }
      # 上传成绩, End
      ###########

      ###########
      # 报告生成, Begin

      # 1）新增个人数据计算
      # 2) 组装个人数据
      # 3) 叠加至整体
      # 

      # 报告生成, End
      ###########
  	}
  end
end
