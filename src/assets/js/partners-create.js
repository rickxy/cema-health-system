/**
 * Partners Create Form
 *
 * This file handles the form submission for creating a new partner.
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
    dropdownParent: $('#partnerForm')
  });

  // Handle form submission
  $('#partnerForm').on('submit', function (e) {
    e.preventDefault();

    // Show loading state
    const submitBtn = $(this).find('button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn
      .prop('disabled', true)
      .html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...');

    // Create FormData object
    const formData = new FormData(this);

    // Send AJAX request
    $.ajax({
      url: '/partners/create/',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        // Show success message
        toastr.success('Partner created successfully');

        // Redirect to partners list after a short delay
        setTimeout(function () {
          window.location.href = '/partners/';
        }, 1500);
      },
      error: function (xhr, status, error) {
        // Show error message
        let errorMessage = 'Error creating partner';
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
