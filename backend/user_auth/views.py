from django.shortcuts import redirect, render   #to use render() and requests()
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.contrib.auth import logout as auth_logout

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'home.html')

@login_required
def dashboard(request):
    user = request.session.get('user')
    if not user:
        return redirect('/')
    return render(request, 'dashboard.html', {'user': user})


def logout(request):
    if request.user.is_authenticated:
        request.user.is_online = False
        request.user.updateLastActivity()
        request.user.save()

    auth_logout(request)
    messages.success(request, "You have been logged out successfully.")
    return render(request, 'logout.html')

def mandatory(request):
    return render(request, 'mandatory.html')