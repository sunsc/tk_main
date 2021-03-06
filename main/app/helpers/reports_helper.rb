module ReportsHelper
  # 保留
  # def report_menus_field menus
  #   return "" if menus.blank?
  #   menu_panel_title = ""
  #   str = %Q{
  #     <ul class="zy-report-menu">
  #     %{menu_panel_title}
  #   }
  #   case menus[0][:data_type]
  #   when "project"
  #     data_type = "project"
  #     menu_panel_title = %Q{
  #       <div class="title">#{LABEL("dict.xiang_mu_bao_gao")}</div>        
  #     }
  #   when "grade"
  #     data_type = "grade"
  #     menu_panel_title = %Q{
  #       <div class="title">#{LABEL("dict.nian_ji_bao_gao")}</div>        
  #     } 
  #   when "klass"
  #     data_type = "class"
  #     menu_panel_title = %Q{
  #       <div class="title">#{LABEL("dict.ban_ji_bao_gao")}</div>        
  #     } 
  #   when "pupil"
  #     data_type = "student"
  #     menu_panel_title = %Q{
  #       <div class="title">#{LABEL("dict.ge_ren_bao_gao")}</div>        
  #     }
  #     str = %Q{
  #       <ul class="zy-report-menu zy-pupil-menu">
  #       %{menu_panel_title}
  #     } 
  #   else
  #     data_type= menus[0][:data_type]
  #   end
  #   str %= {:menu_panel_title => menu_panel_title}

  #   menus.each{|menu|
  #     inner_a = %Q{
  #       <span title="#{menu[:label]}">#{abbrev_menu_label menu[:label]}</span>
  #       <span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>          
  #     }
  #     if menu[:data_type] == "pupil"
  #       inner_a = %Q{
  #         #{abbrev_menu_label menu[:label]}
  #       }
  #     end

  #     menu_str = %Q{
  #       <li>
  #         <a href="#" report_url="#{menu[:report_url]}" data_type="#{menu[:data_type]}">
  #         %{inner_a}
  #         </a>
  #         %{items}
  #       </li>
  #     }

  #     menu_str %= {
  #       :inner_a => inner_a,
  #       :items => report_menus_field(menu[:items])
  #     }
  #     str += menu_str
  #   }
  #   str += %Q{
  #     </ul>
  #   }
  #   return str
  # end

  # def abbrev_menu_label str
  #   ( str.size >7 )? str[0..7] + "..." : str
  # end
  
  # [ return ]: root_group, root_url, [ckp_level] 
  def report_init test_id
    result = {
      :root_group => "", 
      :root_url => "",
      :paper_info_url => ""      
    }
    if current_user.is_project_administrator?
      result[:root_group] = "project"
      result[:root_url] = "/reports_warehouse/tests/#{test_id}/project/#{test_id}.json"
    elsif current_user.is_tenant_administrator? || current_user.is_analyzer? || current_user.is_teacher?
      tenant_uid = current_tenant.nil?? nil : current_tenant.uid
      result[:root_group] = "grade"
      result[:root_url] = "/reports_warehouse/tests/#{test_id}/project/#{test_id}/grade/#{tenant_uid}.json"
    elsif current_user.is_pupil?
      tenant_uid = current_tenant.nil?? "" : current_tenant.uid
      loc_uid = current_user.pupil.location.nil?? "" : current_user.pupil.location.uid
      pup_uid = current_user.pupil.nil?? "" : current_user.pupil.uid
      result[:root_group] = "pupil"
      result[:root_url] = "/reports_warehouse/tests/#{test_id}/project/#{test_id}/grade/#{tenant_uid}/klass/#{loc_uid}/pupil/#{pup_uid}.json"
    end
    result[:paper_info_url] = "/reports_warehouse/tests/#{test_id}/paper_info.json"
    return result
  end
end