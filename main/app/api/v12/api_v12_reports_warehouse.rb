# -*- coding: UTF-8 -*-

module ApiV12ReportsWarehouse
  class API < Grape::API
    format :json

    helpers Doorkeeper::Grape::Helpers
    helpers ApiV12Helper
    helpers ApiV12SharedParamsHelper

    params do
      use :oauth
    end

    resource :reports_warehouse do
      before do
        set_api_header
        doorkeeper_authorize!
        authenticate_api_permission current_user.id, request.request_method, request.fullpath
      end

      desc ''
      params do
        #
      end
      post '*any_path' do
        target_file_path = request.fullpath.to_s.split("/api/v1.2")[1]
        target_file_path = target_file_path.split("?")[0] if target_file_path
        target_user = current_user
        if !params[:any_path].blank? && File.exist?(target_file_path)
          data = File.open(target_file_path, 'rb').read
          data.force_encoding(Encoding::UTF_8)
        else
            status 404
            { message: Common::Locale::i18n("swtk_errors.object_not_found", :message => request.fullpath.to_s ) }
        end
      end
    end
  end
end