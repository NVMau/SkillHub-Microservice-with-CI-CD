/**
 * Autogenerated by Avro
 *
 * DO NOT EDIT DIRECTLY
 */
package com.skillhub.assignment.avro;

import org.apache.avro.specific.SpecificData;
import org.apache.avro.util.Utf8;
import org.apache.avro.message.BinaryMessageEncoder;
import org.apache.avro.message.BinaryMessageDecoder;
import org.apache.avro.message.SchemaStore;

@org.apache.avro.specific.AvroGenerated
public class LectureDeletedEvent extends org.apache.avro.specific.SpecificRecordBase implements org.apache.avro.specific.SpecificRecord {
  private static final long serialVersionUID = -2742552738519490578L;


  public static final org.apache.avro.Schema SCHEMA$ = new org.apache.avro.Schema.Parser().parse("{\"type\":\"record\",\"name\":\"LectureDeletedEvent\",\"namespace\":\"com.skillhub.assignment.avro\",\"fields\":[{\"name\":\"id\",\"type\":\"string\"},{\"name\":\"title\",\"type\":\"string\"},{\"name\":\"description\",\"type\":[\"null\",\"string\"],\"default\":null},{\"name\":\"courseId\",\"type\":\"string\"}]}");
  public static org.apache.avro.Schema getClassSchema() { return SCHEMA$; }

  private static final SpecificData MODEL$ = new SpecificData();

  private static final BinaryMessageEncoder<LectureDeletedEvent> ENCODER =
      new BinaryMessageEncoder<>(MODEL$, SCHEMA$);

  private static final BinaryMessageDecoder<LectureDeletedEvent> DECODER =
      new BinaryMessageDecoder<>(MODEL$, SCHEMA$);

  /**
   * Return the BinaryMessageEncoder instance used by this class.
   * @return the message encoder used by this class
   */
  public static BinaryMessageEncoder<LectureDeletedEvent> getEncoder() {
    return ENCODER;
  }

  /**
   * Return the BinaryMessageDecoder instance used by this class.
   * @return the message decoder used by this class
   */
  public static BinaryMessageDecoder<LectureDeletedEvent> getDecoder() {
    return DECODER;
  }

  /**
   * Create a new BinaryMessageDecoder instance for this class that uses the specified {@link SchemaStore}.
   * @param resolver a {@link SchemaStore} used to find schemas by fingerprint
   * @return a BinaryMessageDecoder instance for this class backed by the given SchemaStore
   */
  public static BinaryMessageDecoder<LectureDeletedEvent> createDecoder(SchemaStore resolver) {
    return new BinaryMessageDecoder<>(MODEL$, SCHEMA$, resolver);
  }

  /**
   * Serializes this LectureDeletedEvent to a ByteBuffer.
   * @return a buffer holding the serialized data for this instance
   * @throws java.io.IOException if this instance could not be serialized
   */
  public java.nio.ByteBuffer toByteBuffer() throws java.io.IOException {
    return ENCODER.encode(this);
  }

  /**
   * Deserializes a LectureDeletedEvent from a ByteBuffer.
   * @param b a byte buffer holding serialized data for an instance of this class
   * @return a LectureDeletedEvent instance decoded from the given buffer
   * @throws java.io.IOException if the given bytes could not be deserialized into an instance of this class
   */
  public static LectureDeletedEvent fromByteBuffer(
      java.nio.ByteBuffer b) throws java.io.IOException {
    return DECODER.decode(b);
  }

  private java.lang.CharSequence id;
  private java.lang.CharSequence title;
  private java.lang.CharSequence description;
  private java.lang.CharSequence courseId;

  /**
   * Default constructor.  Note that this does not initialize fields
   * to their default values from the schema.  If that is desired then
   * one should use <code>newBuilder()</code>.
   */
  public LectureDeletedEvent() {}

  /**
   * All-args constructor.
   * @param id The new value for id
   * @param title The new value for title
   * @param description The new value for description
   * @param courseId The new value for courseId
   */
  public LectureDeletedEvent(java.lang.CharSequence id, java.lang.CharSequence title, java.lang.CharSequence description, java.lang.CharSequence courseId) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.courseId = courseId;
  }

  @Override
  public org.apache.avro.specific.SpecificData getSpecificData() { return MODEL$; }

  @Override
  public org.apache.avro.Schema getSchema() { return SCHEMA$; }

  // Used by DatumWriter.  Applications should not call.
  @Override
  public java.lang.Object get(int field$) {
    switch (field$) {
    case 0: return id;
    case 1: return title;
    case 2: return description;
    case 3: return courseId;
    default: throw new IndexOutOfBoundsException("Invalid index: " + field$);
    }
  }

  // Used by DatumReader.  Applications should not call.
  @Override
  @SuppressWarnings(value="unchecked")
  public void put(int field$, java.lang.Object value$) {
    switch (field$) {
    case 0: id = (java.lang.CharSequence)value$; break;
    case 1: title = (java.lang.CharSequence)value$; break;
    case 2: description = (java.lang.CharSequence)value$; break;
    case 3: courseId = (java.lang.CharSequence)value$; break;
    default: throw new IndexOutOfBoundsException("Invalid index: " + field$);
    }
  }

  /**
   * Gets the value of the 'id' field.
   * @return The value of the 'id' field.
   */
  public java.lang.CharSequence getId() {
    return id;
  }


  /**
   * Sets the value of the 'id' field.
   * @param value the value to set.
   */
  public void setId(java.lang.CharSequence value) {
    this.id = value;
  }

  /**
   * Gets the value of the 'title' field.
   * @return The value of the 'title' field.
   */
  public java.lang.CharSequence getTitle() {
    return title;
  }


  /**
   * Sets the value of the 'title' field.
   * @param value the value to set.
   */
  public void setTitle(java.lang.CharSequence value) {
    this.title = value;
  }

  /**
   * Gets the value of the 'description' field.
   * @return The value of the 'description' field.
   */
  public java.lang.CharSequence getDescription() {
    return description;
  }


  /**
   * Sets the value of the 'description' field.
   * @param value the value to set.
   */
  public void setDescription(java.lang.CharSequence value) {
    this.description = value;
  }

  /**
   * Gets the value of the 'courseId' field.
   * @return The value of the 'courseId' field.
   */
  public java.lang.CharSequence getCourseId() {
    return courseId;
  }


  /**
   * Sets the value of the 'courseId' field.
   * @param value the value to set.
   */
  public void setCourseId(java.lang.CharSequence value) {
    this.courseId = value;
  }

  /**
   * Creates a new LectureDeletedEvent RecordBuilder.
   * @return A new LectureDeletedEvent RecordBuilder
   */
  public static com.skillhub.assignment.avro.LectureDeletedEvent.Builder newBuilder() {
    return new com.skillhub.assignment.avro.LectureDeletedEvent.Builder();
  }

  /**
   * Creates a new LectureDeletedEvent RecordBuilder by copying an existing Builder.
   * @param other The existing builder to copy.
   * @return A new LectureDeletedEvent RecordBuilder
   */
  public static com.skillhub.assignment.avro.LectureDeletedEvent.Builder newBuilder(com.skillhub.assignment.avro.LectureDeletedEvent.Builder other) {
    if (other == null) {
      return new com.skillhub.assignment.avro.LectureDeletedEvent.Builder();
    } else {
      return new com.skillhub.assignment.avro.LectureDeletedEvent.Builder(other);
    }
  }

  /**
   * Creates a new LectureDeletedEvent RecordBuilder by copying an existing LectureDeletedEvent instance.
   * @param other The existing instance to copy.
   * @return A new LectureDeletedEvent RecordBuilder
   */
  public static com.skillhub.assignment.avro.LectureDeletedEvent.Builder newBuilder(com.skillhub.assignment.avro.LectureDeletedEvent other) {
    if (other == null) {
      return new com.skillhub.assignment.avro.LectureDeletedEvent.Builder();
    } else {
      return new com.skillhub.assignment.avro.LectureDeletedEvent.Builder(other);
    }
  }

  /**
   * RecordBuilder for LectureDeletedEvent instances.
   */
  @org.apache.avro.specific.AvroGenerated
  public static class Builder extends org.apache.avro.specific.SpecificRecordBuilderBase<LectureDeletedEvent>
    implements org.apache.avro.data.RecordBuilder<LectureDeletedEvent> {

    private java.lang.CharSequence id;
    private java.lang.CharSequence title;
    private java.lang.CharSequence description;
    private java.lang.CharSequence courseId;

    /** Creates a new Builder */
    private Builder() {
      super(SCHEMA$, MODEL$);
    }

    /**
     * Creates a Builder by copying an existing Builder.
     * @param other The existing Builder to copy.
     */
    private Builder(com.skillhub.assignment.avro.LectureDeletedEvent.Builder other) {
      super(other);
      if (isValidValue(fields()[0], other.id)) {
        this.id = data().deepCopy(fields()[0].schema(), other.id);
        fieldSetFlags()[0] = other.fieldSetFlags()[0];
      }
      if (isValidValue(fields()[1], other.title)) {
        this.title = data().deepCopy(fields()[1].schema(), other.title);
        fieldSetFlags()[1] = other.fieldSetFlags()[1];
      }
      if (isValidValue(fields()[2], other.description)) {
        this.description = data().deepCopy(fields()[2].schema(), other.description);
        fieldSetFlags()[2] = other.fieldSetFlags()[2];
      }
      if (isValidValue(fields()[3], other.courseId)) {
        this.courseId = data().deepCopy(fields()[3].schema(), other.courseId);
        fieldSetFlags()[3] = other.fieldSetFlags()[3];
      }
    }

    /**
     * Creates a Builder by copying an existing LectureDeletedEvent instance
     * @param other The existing instance to copy.
     */
    private Builder(com.skillhub.assignment.avro.LectureDeletedEvent other) {
      super(SCHEMA$, MODEL$);
      if (isValidValue(fields()[0], other.id)) {
        this.id = data().deepCopy(fields()[0].schema(), other.id);
        fieldSetFlags()[0] = true;
      }
      if (isValidValue(fields()[1], other.title)) {
        this.title = data().deepCopy(fields()[1].schema(), other.title);
        fieldSetFlags()[1] = true;
      }
      if (isValidValue(fields()[2], other.description)) {
        this.description = data().deepCopy(fields()[2].schema(), other.description);
        fieldSetFlags()[2] = true;
      }
      if (isValidValue(fields()[3], other.courseId)) {
        this.courseId = data().deepCopy(fields()[3].schema(), other.courseId);
        fieldSetFlags()[3] = true;
      }
    }

    /**
      * Gets the value of the 'id' field.
      * @return The value.
      */
    public java.lang.CharSequence getId() {
      return id;
    }


    /**
      * Sets the value of the 'id' field.
      * @param value The value of 'id'.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder setId(java.lang.CharSequence value) {
      validate(fields()[0], value);
      this.id = value;
      fieldSetFlags()[0] = true;
      return this;
    }

    /**
      * Checks whether the 'id' field has been set.
      * @return True if the 'id' field has been set, false otherwise.
      */
    public boolean hasId() {
      return fieldSetFlags()[0];
    }


    /**
      * Clears the value of the 'id' field.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder clearId() {
      id = null;
      fieldSetFlags()[0] = false;
      return this;
    }

    /**
      * Gets the value of the 'title' field.
      * @return The value.
      */
    public java.lang.CharSequence getTitle() {
      return title;
    }


    /**
      * Sets the value of the 'title' field.
      * @param value The value of 'title'.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder setTitle(java.lang.CharSequence value) {
      validate(fields()[1], value);
      this.title = value;
      fieldSetFlags()[1] = true;
      return this;
    }

    /**
      * Checks whether the 'title' field has been set.
      * @return True if the 'title' field has been set, false otherwise.
      */
    public boolean hasTitle() {
      return fieldSetFlags()[1];
    }


    /**
      * Clears the value of the 'title' field.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder clearTitle() {
      title = null;
      fieldSetFlags()[1] = false;
      return this;
    }

    /**
      * Gets the value of the 'description' field.
      * @return The value.
      */
    public java.lang.CharSequence getDescription() {
      return description;
    }


    /**
      * Sets the value of the 'description' field.
      * @param value The value of 'description'.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder setDescription(java.lang.CharSequence value) {
      validate(fields()[2], value);
      this.description = value;
      fieldSetFlags()[2] = true;
      return this;
    }

    /**
      * Checks whether the 'description' field has been set.
      * @return True if the 'description' field has been set, false otherwise.
      */
    public boolean hasDescription() {
      return fieldSetFlags()[2];
    }


    /**
      * Clears the value of the 'description' field.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder clearDescription() {
      description = null;
      fieldSetFlags()[2] = false;
      return this;
    }

    /**
      * Gets the value of the 'courseId' field.
      * @return The value.
      */
    public java.lang.CharSequence getCourseId() {
      return courseId;
    }


    /**
      * Sets the value of the 'courseId' field.
      * @param value The value of 'courseId'.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder setCourseId(java.lang.CharSequence value) {
      validate(fields()[3], value);
      this.courseId = value;
      fieldSetFlags()[3] = true;
      return this;
    }

    /**
      * Checks whether the 'courseId' field has been set.
      * @return True if the 'courseId' field has been set, false otherwise.
      */
    public boolean hasCourseId() {
      return fieldSetFlags()[3];
    }


    /**
      * Clears the value of the 'courseId' field.
      * @return This builder.
      */
    public com.skillhub.assignment.avro.LectureDeletedEvent.Builder clearCourseId() {
      courseId = null;
      fieldSetFlags()[3] = false;
      return this;
    }

    @Override
    @SuppressWarnings("unchecked")
    public LectureDeletedEvent build() {
      try {
        LectureDeletedEvent record = new LectureDeletedEvent();
        record.id = fieldSetFlags()[0] ? this.id : (java.lang.CharSequence) defaultValue(fields()[0]);
        record.title = fieldSetFlags()[1] ? this.title : (java.lang.CharSequence) defaultValue(fields()[1]);
        record.description = fieldSetFlags()[2] ? this.description : (java.lang.CharSequence) defaultValue(fields()[2]);
        record.courseId = fieldSetFlags()[3] ? this.courseId : (java.lang.CharSequence) defaultValue(fields()[3]);
        return record;
      } catch (org.apache.avro.AvroMissingFieldException e) {
        throw e;
      } catch (java.lang.Exception e) {
        throw new org.apache.avro.AvroRuntimeException(e);
      }
    }
  }

  @SuppressWarnings("unchecked")
  private static final org.apache.avro.io.DatumWriter<LectureDeletedEvent>
    WRITER$ = (org.apache.avro.io.DatumWriter<LectureDeletedEvent>)MODEL$.createDatumWriter(SCHEMA$);

  @Override public void writeExternal(java.io.ObjectOutput out)
    throws java.io.IOException {
    WRITER$.write(this, SpecificData.getEncoder(out));
  }

  @SuppressWarnings("unchecked")
  private static final org.apache.avro.io.DatumReader<LectureDeletedEvent>
    READER$ = (org.apache.avro.io.DatumReader<LectureDeletedEvent>)MODEL$.createDatumReader(SCHEMA$);

  @Override public void readExternal(java.io.ObjectInput in)
    throws java.io.IOException {
    READER$.read(this, SpecificData.getDecoder(in));
  }

  @Override protected boolean hasCustomCoders() { return true; }

  @Override public void customEncode(org.apache.avro.io.Encoder out)
    throws java.io.IOException
  {
    out.writeString(this.id);

    out.writeString(this.title);

    if (this.description == null) {
      out.writeIndex(0);
      out.writeNull();
    } else {
      out.writeIndex(1);
      out.writeString(this.description);
    }

    out.writeString(this.courseId);

  }

  @Override public void customDecode(org.apache.avro.io.ResolvingDecoder in)
    throws java.io.IOException
  {
    org.apache.avro.Schema.Field[] fieldOrder = in.readFieldOrderIfDiff();
    if (fieldOrder == null) {
      this.id = in.readString(this.id instanceof Utf8 ? (Utf8)this.id : null);

      this.title = in.readString(this.title instanceof Utf8 ? (Utf8)this.title : null);

      if (in.readIndex() != 1) {
        in.readNull();
        this.description = null;
      } else {
        this.description = in.readString(this.description instanceof Utf8 ? (Utf8)this.description : null);
      }

      this.courseId = in.readString(this.courseId instanceof Utf8 ? (Utf8)this.courseId : null);

    } else {
      for (int i = 0; i < 4; i++) {
        switch (fieldOrder[i].pos()) {
        case 0:
          this.id = in.readString(this.id instanceof Utf8 ? (Utf8)this.id : null);
          break;

        case 1:
          this.title = in.readString(this.title instanceof Utf8 ? (Utf8)this.title : null);
          break;

        case 2:
          if (in.readIndex() != 1) {
            in.readNull();
            this.description = null;
          } else {
            this.description = in.readString(this.description instanceof Utf8 ? (Utf8)this.description : null);
          }
          break;

        case 3:
          this.courseId = in.readString(this.courseId instanceof Utf8 ? (Utf8)this.courseId : null);
          break;

        default:
          throw new java.io.IOException("Corrupt ResolvingDecoder.");
        }
      }
    }
  }
}










