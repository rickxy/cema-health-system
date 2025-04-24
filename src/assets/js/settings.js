$(document).ready(function () {
  // Initialize DataTable for settings
  const settingsTable = $('#settings-table').DataTable({
    processing: true,
    serverSide: false,
    ajax: {
      url: '/api/settings/',
      dataSrc: ''
    },
    columns: [
      { data: 'key' },
      { data: 'value' },
      { data: 'description' },
      {
        data: null,
        render: function (data, type, row) {
          return `
                        <button class="btn btn-sm btn-primary edit-setting" data-id="${row.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-setting" data-id="${row.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    `;
        }
      }
    ]
  });

  // Handle setting creation
  $('#add-setting-form').on('submit', function (e) {
    e.preventDefault();
    const formData = {
      key: $('#setting-key').val(),
      value: $('#setting-value').val(),
      description: $('#setting-description').val()
    };

    $.ajax({
      url: '/api/settings/',
      method: 'POST',
      data: formData,
      success: function (response) {
        toastr.success('Setting created successfully');
        settingsTable.ajax.reload();
        $('#add-setting-modal').modal('hide');
        $('#add-setting-form')[0].reset();
      },
      error: function (xhr) {
        toastr.error('Error creating setting');
        console.error(xhr);
      }
    });
  });

  // Handle setting edit
  $(document).on('click', '.edit-setting', function () {
    const id = $(this).data('id');
    $.get(`/api/settings/${id}/`, function (data) {
      $('#edit-setting-id').val(data.id);
      $('#edit-setting-key').val(data.key);
      $('#edit-setting-value').val(data.value);
      $('#edit-setting-description').val(data.description);
      $('#edit-setting-modal').modal('show');
    });
  });

  // Handle setting update
  $('#edit-setting-form').on('submit', function (e) {
    e.preventDefault();
    const id = $('#edit-setting-id').val();
    const formData = {
      key: $('#edit-setting-key').val(),
      value: $('#edit-setting-value').val(),
      description: $('#edit-setting-description').val()
    };

    $.ajax({
      url: `/api/settings/${id}/`,
      method: 'PUT',
      data: formData,
      success: function (response) {
        toastr.success('Setting updated successfully');
        settingsTable.ajax.reload();
        $('#edit-setting-modal').modal('hide');
      },
      error: function (xhr) {
        toastr.error('Error updating setting');
        console.error(xhr);
      }
    });
  });

  // Handle setting deletion
  $(document).on('click', '.delete-setting', function () {
    const id = $(this).data('id');
    if (confirm('Are you sure you want to delete this setting?')) {
      $.ajax({
        url: `/api/settings/${id}/`,
        method: 'DELETE',
        success: function () {
          toastr.success('Setting deleted successfully');
          settingsTable.ajax.reload();
        },
        error: function (xhr) {
          toastr.error('Error deleting setting');
          console.error(xhr);
        }
      });
    }
  });
});
