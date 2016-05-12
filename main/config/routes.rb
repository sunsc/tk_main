Rails.application.routes.draw do

  root 'welcomes#index'

  # routes for quiz_paper controller

  resource :quizs do
    member do
      post 'single_quiz_file_upload' 
      post 'quiz_create_type1upload'
      post 'quiz_create_type1save'
      # post 'single_quiz_save'
      get 'quiz_list'
      get 'quiz_get'
    end
    get 'single_quiz'
    post 'subject_related_data'
    post 'single_quiz_save'
  end

  resources :checkpoints do 
    collection do 
      post 'get_nodes'
    end
  end
  
  resources :score_reports do 
    collection do 
      get 'simple'
      get 'profession'
    end
  end

  get '/ckeditors/urlimage'=> "ckeditor#urlimage"

  resources :librarys, :online_tests
  # defined routes for user authentication
  devise_for :users,
    controllers: { sessions: 'users/sessions',
                   registrations: 'users/registrations',
                   passwords: 'users/passwords'},
    path_names: { sign_in: 'login', 
                  sign_out: 'logout' }

  ActiveAdmin.routes(self)
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
