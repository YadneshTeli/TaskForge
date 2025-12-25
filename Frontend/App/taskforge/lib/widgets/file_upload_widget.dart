// lib/widgets/file_upload_widget.dart
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';

class FileUploadWidget extends StatefulWidget {
  final Function(File) onFileSelected;
  final List<String>? allowedExtensions;
  final String buttonLabel;
  final IconData buttonIcon;

  const FileUploadWidget({
    super.key,
    required this.onFileSelected,
    this.allowedExtensions,
    this.buttonLabel = 'Choose File',
    this.buttonIcon = Icons.upload_file,
  });

  @override
  State<FileUploadWidget> createState() => _FileUploadWidgetState();
}

class _FileUploadWidgetState extends State<FileUploadWidget> {
  File? _selectedFile;
  bool _isLoading = false;

  Future<void> _pickFile() async {
    setState(() {
      _isLoading = true;
    });

    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: widget.allowedExtensions != null 
            ? FileType.custom 
            : FileType.any,
        allowedExtensions: widget.allowedExtensions,
      );

      if (result != null && result.files.single.path != null) {
        final file = File(result.files.single.path!);
        setState(() {
          _selectedFile = file;
        });
        widget.onFileSelected(file);
      }
    } catch (e) {
      debugPrint('File selection failed: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to select file. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _clearFile() {
    setState(() {
      _selectedFile = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ElevatedButton.icon(
          onPressed: _isLoading ? null : _pickFile,
          icon: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : Icon(widget.buttonIcon),
          label: Text(widget.buttonLabel),
        ),
        if (_selectedFile != null) ...[
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.blue[200]!),
            ),
            child: Row(
              children: [
                Icon(Icons.insert_drive_file, color: Colors.blue[700]),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _selectedFile!.path.split('/').last,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '${(_selectedFile!.lengthSync() / 1024).toStringAsFixed(2)} KB',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: _clearFile,
                  color: Colors.red,
                  iconSize: 20,
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

class ImageUploadWidget extends StatefulWidget {
  final Function(File) onImageSelected;
  final String buttonLabel;

  const ImageUploadWidget({
    super.key,
    required this.onImageSelected,
    this.buttonLabel = 'Choose Image',
  });

  @override
  State<ImageUploadWidget> createState() => _ImageUploadWidgetState();
}

class _ImageUploadWidgetState extends State<ImageUploadWidget> {
  File? _selectedImage;
  bool _isLoading = false;

  Future<void> _pickImage() async {
    setState(() {
      _isLoading = true;
    });

    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.image,
      );

      if (result != null && result.files.single.path != null) {
        final file = File(result.files.single.path!);
        setState(() {
          _selectedImage = file;
        });
        widget.onImageSelected(file);
      }
    } catch (e) {
      debugPrint('Image selection failed: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Failed to select image. Please try again.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _clearImage() {
    setState(() {
      _selectedImage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_selectedImage != null) ...[
          Stack(
            alignment: Alignment.topRight,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.file(
                  _selectedImage!,
                  height: 200,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundColor: Colors.red,
                  child: IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: _clearImage,
                    iconSize: 20,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
        ],
        ElevatedButton.icon(
          onPressed: _isLoading ? null : _pickImage,
          icon: _isLoading
              ? const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.image),
          label: Text(widget.buttonLabel),
        ),
      ],
    );
  }
}
