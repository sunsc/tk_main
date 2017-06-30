# set path to application
#app_dir = File.expand_path("../", __FILE__)
app_dir=File.expand_path("../..", __FILE__)
shared_dir = "#{app_dir}/shared"
working_directory app_dir


# Set unicorn options
worker_processes 5
preload_app true
timeout 30

# Set up socket location
listen "/tmp/unicorn.sock", :backlog => 64

# Logging
stderr_path "/tmp/log/unicorn.stderr.log"
stdout_path "/tmp/log/unicorn.stdout.log"

# Set master PID location
pid "/tmp/pids/unicorn.pid"
