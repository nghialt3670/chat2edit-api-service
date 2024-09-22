import AttachmentResponse from "../schemas/attachment-response";
import Attachment from "../models/attachment";

export default class AttachmentMapper {
  static toResponse(attachment: Attachment): AttachmentResponse {
    if (!attachment._id) throw new Error("Attachment not inserted");

    const response: AttachmentResponse = {
      id: attachment._id,
      type: attachment.type,
      link: attachment.link,
      ref: attachment.ref,
    };

    if (attachment.file) {
      response.file = {
        name: attachment.file.name,
        size: attachment.file.size,
        content_type: attachment.file.content_type,
        thumbnail: attachment.file.thumbnail
          ? {
              width: attachment.file.thumbnail.width,
              height: attachment.file.thumbnail.height,
            }
          : undefined,
      };
    }

    return response;
  }
}
