Rails.application.routes.draw do
  root "cpus#index"
  resources :cpus
end
