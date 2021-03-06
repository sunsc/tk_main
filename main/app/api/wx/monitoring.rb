# -*- coding: UTF-8 -*-

module Monitoring
  class API < Grape::API
    version 'v1.1', using: :path #/api/v1/<resource>/<action>
    format :json
    prefix "api/wx".to_sym

    helpers ApiHelper
    helpers SharedParamsHelper

    params do
      use :authenticate
    end
    resource :monitorings do #monitorings begin

      before do
        set_api_header
        authenticate!
      end

      ###########

      desc '获取测试状态 get /api/wx/v1.1/monitorings/check_status'
      params do
        requires :task_uid, type: String, allow_blank: false
      end
      post :check_status do
        target_task = TaskList.where(uid: params[:task_uid]).first
        if target_task
          target_jobs = target_task.job_lists.order({dt_update: :desc})

          {
            :name => target_task.name,
            :jobs => target_jobs.map{|j|
              {
                :job_uid => j.uid,
                :name => j.name,
                :progress => j.process
              }
            }
          }
        else
          status 404
          {
            :message => "Not Found"
          }
        end
      end

      ###########

    end #monitorings end
  end #class end
end #monitoring end