/**
 * Components Create Form
 *
 * This file handles the form submission for creating a new component.
 */

$(document).ready(function () {
  // Initialize toastr for notifications
  toastr.options = {
    closeButton: true,
    debug: false,
    newestOnTop: false,
    progressBar: true,
    positionClass: 'toast-top-right',
    preventDuplicates: false,
    onclick: null,
    showDuration: '300',
    hideDuration: '1000',
    timeOut: '5000',
    extendedTimeOut: '1000',
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut'
  };

  // Initialize Select2 for dropdowns
  $('#status').select2({
    dropdownParent: $('#componentForm')
  });

  // Handle image preview
  $('#image').on('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $('#imagePreview').attr('src', e.target.result).show();
      };
      reader.readAsDataURL(file);
    }
  });

  // Handle status badge update
  $('#status').on('change', function () {
    const status = $(this).val();
    const badge = $('#statusBadge');

    // Remove all status classes
    badge.removeClass('bg-label-success bg-label-danger bg-label-warning bg-label-secondary');

    // Add appropriate class based on status
    switch (status) {
      case 'active':
        badge.addClass('bg-label-success');
        break;
      case 'inactive':
        badge.addClass('bg-label-danger');
        break;
      case 'pending':
        badge.addClass('bg-label-warning');
        break;
      default:
        badge.addClass('bg-label-secondary');
    }

    // Update badge text
    badge.text(status.charAt(0).toUpperCase() + status.slice(1) || 'Not selected');
  });

  // Handle form submission
  $('#componentForm').on('submit', function (e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = $(this).find('button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn
      .prop('disabled', true)
      .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...');

    // Create FormData object
    const formData = new FormData(this);

    // Ensure is_featured is included in the form data
    const isFeatured = $('#is_featured').is(':checked');
    formData.set('is_featured', isFeatured);

    // Debug logs
    console.log('Form Data Contents:');
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }
    console.log('is_featured value:', isFeatured);

    // Send AJAX request
    $.ajax({
      url: '/components/create/api/',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRFToken': $('input[name="csrfmiddlewaretoken"]').val()
      },
      success: function (response) {
        console.log('Success Response:', response);
        // Show success message
        toastr.success('Component created successfully');

        // Redirect to components list using the URL from the response
        if (response.redirect_url) {
          window.location.href = response.redirect_url;
        } else {
          window.location.href = '/components/';
        }
      },
      error: function (xhr, status, error) {
        console.error('Error Response:', {
          status: status,
          error: error,
          response: xhr.responseText
        });

        // Show error message
        let errorMessage = 'Error creating component';
        if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        }
        toastr.error(errorMessage);

        // Reset button state
        submitBtn.prop('disabled', false).text(originalText);
      }
    });
  });
});
